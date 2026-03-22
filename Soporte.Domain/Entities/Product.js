// productId = UUID, nitCustomer = FK → Customer
class Product {
  constructor(
    productId,
    nitCustomer,
    productName,
    description = null,
    createdAt = null,
    updatedAt = null,
    deletedAt = null
  ) {
    if (!productId || typeof productId !== 'string') {
      throw new Error('Product: productId is required and must be a string (UUID).');
    }
    if (!nitCustomer || typeof nitCustomer !== 'string') {
      throw new Error('Product: nitCustomer is required and must be a string.');
    }
    if (!productName || typeof productName !== 'string') {
      throw new Error('Product: productName is required and must be a string.');
    }

    this.productId = productId;
    this.nitCustomer = nitCustomer.trim();
    this.productName = productName.trim();
    this.description = description ? description.trim() : null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isActive() {
    return this.deletedAt === null || this.deletedAt === undefined;
  }
}

module.exports = { Product };
