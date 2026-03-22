class CerrarTicketUseCase {
  constructor(ticketRepository) {
    if (!ticketRepository) {
      throw new Error('CerrarTicketUseCase: ticketRepository is required.');
    }
    this.ticketRepository = ticketRepository;
  }

  async execute({ ticketId, requestingUserId }) {
    if (!ticketId) {
      throw new Error('CerrarTicketUseCase: ticketId is required.');
    }
    if (!requestingUserId) {
      throw new Error('CerrarTicketUseCase: requestingUserId is required.');
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`CerrarTicketUseCase: Ticket with id "${ticketId}" not found.`);
    }

    ticket.close();

    const updatedTicket = await this.ticketRepository.update(ticket);

    return updatedTicket;
  }
}

module.exports = { CerrarTicketUseCase };
