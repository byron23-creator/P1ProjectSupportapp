class ITicketRepository {
  async findAll() {
    throw new Error('ITicketRepository.findAll() must be implemented.');
  }

  async findAllEscalated() {
    throw new Error('ITicketRepository.findAllEscalated() must be implemented.');
  }

  async findById(ticketId) {
    throw new Error('ITicketRepository.findById() must be implemented.');
  }

  async create(ticket) {
    throw new Error('ITicketRepository.create() must be implemented.');
  }

  async update(ticket) {
    throw new Error('ITicketRepository.update() must be implemented.');
  }

  async softDelete(ticketId) {
    throw new Error('ITicketRepository.softDelete() must be implemented.');
  }
}

module.exports = { ITicketRepository };
