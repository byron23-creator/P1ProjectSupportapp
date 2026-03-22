// commentId = UUID, ticketId = FK → Ticket, userId = FK → User
class Comment {
  constructor(
    commentId,
    ticketId,
    userId,
    content,
    createdAt = null,
    updatedAt = null,
    deletedAt = null
  ) {
    if (!commentId || typeof commentId !== 'string') {
      throw new Error('Comment: commentId is required and must be a string (UUID).');
    }
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Comment: ticketId is required and must be a string (UUID).');
    }
    if (!userId || typeof userId !== 'string') {
      throw new Error('Comment: userId is required and must be a string (UUID).');
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Comment: content is required and cannot be empty.');
    }

    this.commentId = commentId;
    this.ticketId = ticketId;
    this.userId = userId;
    this.content = content.trim();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isActive() {
    return this.deletedAt === null || this.deletedAt === undefined;
  }
}

module.exports = { Comment };
