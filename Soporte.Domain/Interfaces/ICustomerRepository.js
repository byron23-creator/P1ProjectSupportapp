// nit = PK del Customer
class ICustomerRepository {
  async findAll() {
    throw new Error('ICustomerRepository.findAll() must be implemented.');
  }

  async findByNit(nit) {
    throw new Error('ICustomerRepository.findByNit() must be implemented.');
  }

  async create(customer) {
    throw new Error('ICustomerRepository.create() must be implemented.');
  }

  async update(customer) {
    throw new Error('ICustomerRepository.update() must be implemented.');
  }

  async softDelete(nit) {
    throw new Error('ICustomerRepository.softDelete() must be implemented.');
  }
}

module.exports = { ICustomerRepository };
