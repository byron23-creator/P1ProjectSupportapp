const { IProductRepository } = require('../../Soporte.Domain/Interfaces/IProductRepository');
const { Product } = require('../../Soporte.Domain/Entities/Product');
const { query } = require('../Database/connection');

class ProductRepository extends IProductRepository {
  _mapRowToEntity(row) {
    return new Product(
      row.product_id,
      row.nit_customer,
      row.product_name,
      row.description,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  async findAll() {
    const sql = `
      SELECT * FROM products
      WHERE deleted_at IS NULL
      ORDER BY product_name ASC
    `;
    const result = await query(sql);
    return result.rows.map(this._mapRowToEntity);
  }

  async findByCustomer(nitCustomer) {
    const sql = `
      SELECT * FROM products
      WHERE nit_customer = $1
        AND deleted_at IS NULL
      ORDER BY product_name ASC
    `;
    const result = await query(sql, [nitCustomer]);
    return result.rows.map(this._mapRowToEntity);
  }

  async findById(productId) {
    const sql = `
      SELECT * FROM products
      WHERE product_id = $1
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [productId]);
    if (result.rows.length === 0) return null;
    return this._mapRowToEntity(result.rows[0]);
  }

  async create(product) {
    const sql = `
      INSERT INTO products (product_id, nit_customer, product_name, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [product.productId, product.nitCustomer, product.productName, product.description];
    const result = await query(sql, params);
    return this._mapRowToEntity(result.rows[0]);
  }

  async update(product) {
    const sql = `
      UPDATE products
      SET nit_customer = $2, product_name = $3, description = $4
      WHERE product_id = $1
        AND deleted_at IS NULL
      RETURNING *
    `;
    const params = [product.productId, product.nitCustomer, product.productName, product.description];
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      throw new Error(`ProductRepository: Product "${product.productId}" not found for update.`);
    }
    return this._mapRowToEntity(result.rows[0]);
  }

  async softDelete(productId) {
    const sql = `
      UPDATE products
      SET deleted_at = NOW()
      WHERE product_id = $1
        AND deleted_at IS NULL
    `;
    await query(sql, [productId]);
  }
}

module.exports = { ProductRepository };
