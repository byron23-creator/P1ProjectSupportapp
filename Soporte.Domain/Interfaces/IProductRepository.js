class IProductRepository {
  async findAll() {
    throw new Error('IProductRepository.findAll() must be implemented.');
  }

  async findByCustomer(nitCustomer) {
    throw new Error('IProductRepository.findByCustomer() must be implemented.');
  }

  async findById(productId) {
    throw new Error('IProductRepository.findById() must be implemented.');
  }

  async create(product) {
    throw new Error('IProductRepository.create() must be implemented.');
  }

  async update(product) {
    throw new Error('IProductRepository.update() must be implemented.');
  }

  async softDelete(productId) {
    throw new Error('IProductRepository.softDelete() must be implemented.');
  }
}

module.exports = { IProductRepository };
