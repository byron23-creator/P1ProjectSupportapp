const VALID_STATUSES = ['Abierto', 'En Progreso', 'Cerrado'];
const VALID_LEVELS = [1, 2];

class Ticket {
  constructor(
    ticketId,
    productId,
    assignedUserId,
    subject,
    description,
    type,
    impact,
    status = 'Abierto',
    currentLevel = 1,
    createdAt = null,
    updatedAt = null,
    deletedAt = null
  ) {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Ticket: ticketId is required and must be a string (UUID).');
    }
    if (!productId || typeof productId !== 'string') {
      throw new Error('Ticket: productId is required and must be a string (UUID).');
    }
    if (!subject || typeof subject !== 'string') {
      throw new Error('Ticket: subject is required and must be a string.');
    }
    if (!description || typeof description !== 'string') {
      throw new Error('Ticket: description is required and must be a string.');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('Ticket: type is required and must be a string.');
    }
    if (!impact || typeof impact !== 'string') {
      throw new Error('Ticket: impact is required and must be a string.');
    }
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Ticket: status must be one of [${VALID_STATUSES.join(', ')}].`);
    }
    if (!VALID_LEVELS.includes(currentLevel)) {
      throw new Error(`Ticket: currentLevel must be one of [${VALID_LEVELS.join(', ')}].`);
    }

    this.ticketId = ticketId;
    this.productId = productId;
    this.assignedUserId = assignedUserId || null;
    this.subject = subject.trim();
    this.description = description.trim();
    this.type = type.trim();
    this.impact = impact.trim();
    this.status = status;
    this.currentLevel = currentLevel;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isOpen() {
    return this.status === 'Abierto';
  }

  isInProgress() {
    return this.status === 'En Progreso';
  }

  isClosed() {
    return this.status === 'Cerrado';
  }

  isEscalated() {
    return this.currentLevel === 2;
  }

  isActive() {
    return this.deletedAt === null || this.deletedAt === undefined;
  }

  escalateToL2() {
    if (this.isClosed()) {
      throw new Error('Ticket: Cannot escalate a closed ticket.');
    }
    if (this.isEscalated()) {
      throw new Error('Ticket: Ticket is already escalated to L2.');
    }
    this.currentLevel = 2;
    this.status = 'En Progreso';
  }

  close() {
    if (this.isClosed()) {
      throw new Error('Ticket: Ticket is already closed.');
    }
    this.status = 'Cerrado';
  }
}

module.exports = { Ticket, VALID_STATUSES, VALID_LEVELS };
