// roles válidos: L1 = agente nivel 1, L2 = agente nivel 2
const VALID_ROLES = ['L1', 'L2'];

class User {
  constructor(
    userId,
    fullName,
    email,
    passwordHash,
    passwordSalt,
    role,
    createdAt = null,
    updatedAt = null,
    deletedAt = null
  ) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User: userId is required and must be a string (UUID).');
    }
    if (!fullName || typeof fullName !== 'string') {
      throw new Error('User: fullName is required and must be a string.');
    }
    if (!email || typeof email !== 'string') {
      throw new Error('User: email is required and must be a string.');
    }
    if (!passwordHash || typeof passwordHash !== 'string') {
      throw new Error('User: passwordHash is required.');
    }
    if (!passwordSalt || typeof passwordSalt !== 'string') {
      throw new Error('User: passwordSalt is required.');
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`User: role must be one of [${VALID_ROLES.join(', ')}].`);
    }

    this.userId = userId;
    this.fullName = fullName.trim();
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.passwordSalt = passwordSalt;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isActive() {
    return this.deletedAt === null || this.deletedAt === undefined;
  }

  isL1() {
    return this.role === 'L1';
  }

  isL2() {
    return this.role === 'L2';
  }

  toPublic() {
    return {
      userId: this.userId,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User, VALID_ROLES };
