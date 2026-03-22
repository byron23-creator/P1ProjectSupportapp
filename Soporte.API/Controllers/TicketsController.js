// Rutas montadas en /api/tickets
// GET /           → L1: todos | L2: solo escalados
// GET /:id        → L1, L2
// POST /          → L1 only  | body: { productId, subject, description, type, impact }
// PATCH /:id/escalar → L1 only
// PATCH /:id/cerrar  → L1, L2
// GET /:id/pdf    → L1, L2
const { Router } = require('express');
const { authenticate, authorize } = require('../Middleware/authMiddleware');

const { CrearTicketUseCase }   = require('../../Soporte.Application/UseCases/CrearTicketUseCase');
const { EscalarTicketUseCase } = require('../../Soporte.Application/UseCases/EscalarTicketUseCase');
const { CerrarTicketUseCase }  = require('../../Soporte.Application/UseCases/CerrarTicketUseCase');

const { TicketRepository }  = require('../../Soporte.Infrastructure/Repositories/TicketRepository');
const { UserRepository }    = require('../../Soporte.Infrastructure/Repositories/UserRepository');
const { CommentRepository } = require('../../Soporte.Infrastructure/Repositories/CommentRepository');
const { TicketPdfService }  = require('../../Soporte.Infrastructure/Services/TicketPdfService');

const ticketRepository  = new TicketRepository();
const userRepository    = new UserRepository();
const commentRepository = new CommentRepository();
const ticketPdfService  = new TicketPdfService();

const crearTicketUseCase   = new CrearTicketUseCase(ticketRepository, null, userRepository);
const escalarTicketUseCase = new EscalarTicketUseCase(ticketRepository);
const cerrarTicketUseCase  = new CerrarTicketUseCase(ticketRepository);

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const tickets = req.user.role === 'L2'
      ? await ticketRepository.findAllEscalated()
      : await ticketRepository.findAll();
    return res.status(200).json({ data: tickets });
  } catch (err) {
    console.error('[TicketsController] GET /:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await ticketRepository.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket "${req.params.id}" not found.` });
    }
    return res.status(200).json({ data: ticket });
  } catch (err) {
    console.error('[TicketsController] GET /:id:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/', authenticate, authorize('L1'), async (req, res) => {
  try {
    const { productId, subject, description, type, impact } = req.body;
    const ticket = await crearTicketUseCase.execute({
      productId,
      assignedUserId: req.user.userId,
      subject,
      description,
      type,
      impact,
    });
    return res.status(201).json({ data: ticket });
  } catch (err) {
    console.error('[TicketsController] POST /:', err.message);
    const isValidation = err.message.includes('required') || err.message.includes('not found');
    return res.status(isValidation ? 400 : 500).json({ error: err.message });
  }
});

router.patch('/:id/escalar', authenticate, authorize('L1'), async (req, res) => {
  try {
    const ticket = await escalarTicketUseCase.execute({
      ticketId: req.params.id,
      requestingUserId: req.user.userId,
    });
    return res.status(200).json({ data: ticket });
  } catch (err) {
    console.error('[TicketsController] PATCH /:id/escalar:', err.message);
    const isBusinessRule = err.message.includes('Cannot') || err.message.includes('already') || err.message.includes('not found');
    return res.status(isBusinessRule ? 422 : 500).json({ error: err.message });
  }
});

router.patch('/:id/cerrar', authenticate, async (req, res) => {
  try {
    const ticket = await cerrarTicketUseCase.execute({
      ticketId: req.params.id,
      requestingUserId: req.user.userId,
    });
    return res.status(200).json({ data: ticket });
  } catch (err) {
    console.error('[TicketsController] PATCH /:id/cerrar:', err.message);
    const isBusinessRule = err.message.includes('already') || err.message.includes('not found');
    return res.status(isBusinessRule ? 422 : 500).json({ error: err.message });
  }
});

router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const ticket = await ticketRepository.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket "${req.params.id}" not found.` });
    }
    const comments = await commentRepository.findByTicketId(req.params.id);
    const pdfBuffer = await ticketPdfService.generateTicketPdf({ ticket, comments });
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="ticket-${ticket.ticketId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[TicketsController] GET /:id/pdf:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
