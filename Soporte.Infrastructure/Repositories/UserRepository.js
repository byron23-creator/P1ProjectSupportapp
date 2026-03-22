const { IUserRepository } = require('../../Soporte.Domain/Interfaces/IUserRepository');
const { User } = require('../../Soporte.Domain/Entities/User');
const { query } = require('../Database/connection');

class UserRepository extends IUserRepository {
  _mapRowToEntity(row) {
    return new User(
      row.user_id,
      row.full_name,
      row.email,
      row.password_hash,
      row.password_salt,
      row.role,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  async findAll() {
    const sql = `
      SELECT * FROM users
      WHERE deleted_at IS NULL
      ORDER BY full_name ASC
    `;
    const result = await query(sql);
    return result.rows.map(this._mapRowToEntity);
  }

  async findById(userId) {
    const sql = `
      SELECT * FROM users
      WHERE user_id = $1
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [userId]);
    if (result.rows.length === 0) return null;
    return this._mapRowToEntity(result.rows[0]);
  }

  async findByEmail(email) {
    const sql = `
      SELECT * FROM users
      WHERE email = $1
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [email.toLowerCase()]);
    if (result.rows.length === 0) return null;
    return this._mapRowToEntity(result.rows[0]);
  }

  async create(user) {
    const sql = `
      INSERT INTO users
        (user_id, full_name, email, password_hash, password_salt, role)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      user.userId,
      user.fullName,
      user.email,
      user.passwordHash,
      user.passwordSalt,
      user.role,
    ];
    const result = await query(sql, params);
    return this._mapRowToEntity(result.rows[0]);
  }

  async update(user) {
    const sql = `
      UPDATE users
      SET
        full_name     = $2,
        email         = $3,
        password_hash = $4,
        password_salt = $5,
        role          = $6
      WHERE user_id = $1
        AND deleted_at IS NULL
      RETURNING *
    `;
    const params = [
      user.userId,
      user.fullName,
      user.email,
      user.passwordHash,
      user.passwordSalt,
      user.role,
    ];
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      throw new Error(`UserRepository: User "${user.userId}" not found for update.`);
    }
    return this._mapRowToEntity(result.rows[0]);
  }

  async softDelete(userId) {
    const sql = `
      UPDATE users
      SET deleted_at = NOW()
      WHERE user_id = $1
        AND deleted_at IS NULL
    `;
    await query(sql, [userId]);
  }
}

module.exports = { UserRepository };
