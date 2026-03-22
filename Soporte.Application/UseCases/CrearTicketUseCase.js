const { v4: uuidv4 } = require('uuid');
const { Ticket } = require('../../Soporte.Domain/Entities/Ticket');

class CrearTicketUseCase {
  constructor(ticketRepository, productRepository, userRepository) {
    if (!ticketRepository) throw new Error('CrearTicketUseCase: ticketRepository is required.');
    this.ticketRepository  = ticketRepository;
    this.productRepository = productRepository || null;
    this.userRepository    = userRepository    || null;
  }

  async execute({ productId, assignedUserId, subject, description, type, impact }) {
    if (!productId)    throw new Error('CrearTicketUseCase: productId is required.');
    if (!subject)      throw new Error('CrearTicketUseCase: subject is required.');
    if (!description)  throw new Error('CrearTicketUseCase: description is required.');
    if (!type)         throw new Error('CrearTicketUseCase: type is required.');
    if (!impact)       throw new Error('CrearTicketUseCase: impact is required.');

    if (this.productRepository) {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new Error(`CrearTicketUseCase: Product "${productId}" not found.`);
      }
    }

    if (assignedUserId && this.userRepository) {
      const user = await this.userRepository.findById(assignedUserId);
      if (!user) {
        throw new Error(`CrearTicketUseCase: User "${assignedUserId}" not found.`);
      }
    }

    const ticket = new Ticket(
      uuidv4(),
      productId,
      assignedUserId || null,
      subject,
      description,
      type,
      impact
    );

    const savedTicket = await this.ticketRepository.create(ticket);

    return savedTicket;
  }
}

module.exports = { CrearTicketUseCase };
