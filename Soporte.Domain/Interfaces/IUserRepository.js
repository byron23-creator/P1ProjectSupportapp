class IUserRepository {
  async findAll() {
    throw new Error('IUserRepository.findAll() must be implemented.');
  }

  async findById(userId) {
    throw new Error('IUserRepository.findById() must be implemented.');
  }

  async findByEmail(email) {
    throw new Error('IUserRepository.findByEmail() must be implemented.');
  }

  async create(user) {
    throw new Error('IUserRepository.create() must be implemented.');
  }

  async update(user) {
    throw new Error('IUserRepository.update() must be implemented.');
  }

  async softDelete(userId) {
    throw new Error('IUserRepository.softDelete() must be implemented.');
  }
}

module.exports = { IUserRepository };
