class ICommentRepository {
  async findByTicketId(ticketId) {
    throw new Error('ICommentRepository.findByTicketId() must be implemented.');
  }

  async findById(commentId) {
    throw new Error('ICommentRepository.findById() must be implemented.');
  }

  async create(comment) {
    throw new Error('ICommentRepository.create() must be implemented.');
  }

  async softDelete(commentId) {
    throw new Error('ICommentRepository.softDelete() must be implemented.');
  }
}

module.exports = { ICommentRepository };
