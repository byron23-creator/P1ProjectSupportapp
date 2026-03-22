// Rutas montadas en /api/comments
// GET    /ticket/:ticketId → L1, L2
// POST   /                 → L1, L2 | body: { ticketId, content }
// DELETE /:id              → solo el autor del comentario
const { Router } = require('express');
const { authenticate } = require('../Middleware/authMiddleware');

const { CrearComentarioUseCase } = require('../../Soporte.Application/UseCases/CrearComentarioUseCase');

const { CommentRepository } = require('../../Soporte.Infrastructure/Repositories/CommentRepository');
const { TicketRepository }  = require('../../Soporte.Infrastructure/Repositories/TicketRepository');
const { UserRepository }    = require('../../Soporte.Infrastructure/Repositories/UserRepository');

const commentRepository = new CommentRepository();
const ticketRepository  = new TicketRepository();
const userRepository    = new UserRepository();

const crearComentarioUseCase = new CrearComentarioUseCase(
  commentRepository,
  ticketRepository,
  userRepository
);

const router = Router();

router.get('/ticket/:ticketId', authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket "${ticketId}" not found.` });
    }
    const comments = await commentRepository.findByTicketId(ticketId);
    return res.status(200).json({ data: comments });
  } catch (err) {
    console.error('[CommentsController] GET /ticket/:ticketId:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { ticketId, content } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'ticketId is required.' });
    }
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'content cannot be empty.' });
    }
    const comment = await crearComentarioUseCase.execute({
      ticketId,
      userId: req.user.userId,
      content,
    });
    return res.status(201).json({ data: comment });
  } catch (err) {
    console.error('[CommentsController] POST /:', err.message);
    const isBusinessRule =
      err.message.includes('not found') ||
      err.message.includes('closed') ||
      err.message.includes('empty');
    return res.status(isBusinessRule ? 422 : 500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await commentRepository.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: `Comment "${req.params.id}" not found.` });
    }
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own comments.' });
    }
    await commentRepository.softDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error('[CommentsController] DELETE /:id:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
