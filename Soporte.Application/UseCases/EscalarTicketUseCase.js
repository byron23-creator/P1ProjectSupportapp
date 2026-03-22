class EscalarTicketUseCase {
  constructor(ticketRepository) {
    if (!ticketRepository) {
      throw new Error('EscalarTicketUseCase: ticketRepository is required.');
    }
    this.ticketRepository = ticketRepository;
  }

  async execute({ ticketId, requestingUserId }) {
    if (!ticketId) {
      throw new Error('EscalarTicketUseCase: ticketId is required.');
    }
    if (!requestingUserId) {
      throw new Error('EscalarTicketUseCase: requestingUserId is required.');
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`EscalarTicketUseCase: Ticket with id "${ticketId}" not found.`);
    }

    ticket.escalateToL2();

    const updatedTicket = await this.ticketRepository.update(ticket);

    return updatedTicket;
  }
}

module.exports = { EscalarTicketUseCase };
