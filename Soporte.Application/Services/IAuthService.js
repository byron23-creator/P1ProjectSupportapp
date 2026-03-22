class IAuthService {
  async hashPassword(plainPassword) {
    throw new Error('IAuthService.hashPassword() must be implemented.');
  }

  async verifyPassword(plainPassword, hash, salt) {
    throw new Error('IAuthService.verifyPassword() must be implemented.');
  }

  async generateToken(payload) {
    throw new Error('IAuthService.generateToken() must be implemented.');
  }

  async verifyToken(token) {
    throw new Error('IAuthService.verifyToken() must be implemented.');
  }
}

module.exports = { IAuthService };
