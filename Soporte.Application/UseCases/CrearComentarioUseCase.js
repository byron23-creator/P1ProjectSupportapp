const { v4: uuidv4 } = require('uuid');
const { Comment } = require('../../Soporte.Domain/Entities/Comment');

class CrearComentarioUseCase {
  constructor(commentRepository, ticketRepository, userRepository) {
    if (!commentRepository) throw new Error('CrearComentarioUseCase: commentRepository is required.');
    if (!ticketRepository)  throw new Error('CrearComentarioUseCase: ticketRepository is required.');
    if (!userRepository)    throw new Error('CrearComentarioUseCase: userRepository is required.');

    this.commentRepository = commentRepository;
    this.ticketRepository  = ticketRepository;
    this.userRepository    = userRepository;
  }

  async execute({ ticketId, userId, content }) {
    if (!ticketId) throw new Error('CrearComentarioUseCase: ticketId is required.');
    if (!userId)   throw new Error('CrearComentarioUseCase: userId is required.');
    if (!content || content.trim().length === 0) {
      throw new Error('CrearComentarioUseCase: content cannot be empty.');
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`CrearComentarioUseCase: Ticket "${ticketId}" not found.`);
    }
    if (ticket.isClosed()) {
      throw new Error('CrearComentarioUseCase: Cannot add a comment to a closed ticket.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`CrearComentarioUseCase: User "${userId}" not found.`);
    }

    const comment = new Comment(
      uuidv4(),
      ticketId,
      userId,
      content.trim()
    );

    const savedComment = await this.commentRepository.create(comment);

    return savedComment;
  }
}

module.exports = { CrearComentarioUseCase };
