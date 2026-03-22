// nit = PK (Tax ID)
class Customer {
  constructor(nit, companyName, contactEmail, createdAt = null, updatedAt = null, deletedAt = null) {
    if (!nit || typeof nit !== 'string') {
      throw new Error('Customer: nit is required and must be a string.');
    }
    if (!companyName || typeof companyName !== 'string') {
      throw new Error('Customer: companyName is required and must be a string.');
    }
    if (!contactEmail || typeof contactEmail !== 'string') {
      throw new Error('Customer: contactEmail is required and must be a string.');
    }

    this.nit = nit.trim();
    this.companyName = companyName.trim();
    this.contactEmail = contactEmail.trim().toLowerCase();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isActive() {
    return this.deletedAt === null || this.deletedAt === undefined;
  }
}

module.exports = { Customer };
