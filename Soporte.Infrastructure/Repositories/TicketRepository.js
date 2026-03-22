const { ITicketRepository } = require('../../Soporte.Domain/Interfaces/ITicketRepository');
const { Ticket } = require('../../Soporte.Domain/Entities/Ticket');
const { query } = require('../Database/connection');

class TicketRepository extends ITicketRepository {
  _mapRowToEntity(row) {
    return new Ticket(
      row.ticket_id,
      row.product_id,
      row.assigned_user_id,
      row.subject,
      row.description,
      row.type,
      row.impact,
      row.status,
      row.current_level,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  async findAll() {
    const sql = `
      SELECT * FROM tickets
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await query(sql);
    return result.rows.map(this._mapRowToEntity);
  }

  async findAllEscalated() {
    const sql = `
      SELECT * FROM tickets
      WHERE deleted_at IS NULL
        AND current_level = 2
      ORDER BY created_at DESC
    `;
    const result = await query(sql);
    return result.rows.map(this._mapRowToEntity);
  }

  async findById(ticketId) {
    const sql = `
      SELECT * FROM tickets
      WHERE ticket_id = $1
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [ticketId]);
    if (result.rows.length === 0) return null;
    return this._mapRowToEntity(result.rows[0]);
  }

  async create(ticket) {
    const sql = `
      INSERT INTO tickets
        (ticket_id, product_id, assigned_user_id, subject, description, type, impact, status, current_level)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      ticket.ticketId,
      ticket.productId,
      ticket.assignedUserId,
      ticket.subject,
      ticket.description,
      ticket.type,
      ticket.impact,
      ticket.status,
      ticket.currentLevel,
    ];
    const result = await query(sql, params);
    return this._mapRowToEntity(result.rows[0]);
  }

  async update(ticket) {
    const sql = `
      UPDATE tickets
      SET
        product_id       = $2,
        assigned_user_id = $3,
        subject          = $4,
        description      = $5,
        type             = $6,
        impact           = $7,
        status           = $8,
        current_level    = $9
      WHERE ticket_id = $1
        AND deleted_at IS NULL
      RETURNING *
    `;
    const params = [
      ticket.ticketId,
      ticket.productId,
      ticket.assignedUserId,
      ticket.subject,
      ticket.description,
      ticket.type,
      ticket.impact,
      ticket.status,
      ticket.currentLevel,
    ];
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      throw new Error(`TicketRepository: Ticket "${ticket.ticketId}" not found for update.`);
    }
    return this._mapRowToEntity(result.rows[0]);
  }

  async softDelete(ticketId) {
    const sql = `
      UPDATE tickets
      SET deleted_at = NOW()
      WHERE ticket_id = $1
        AND deleted_at IS NULL
    `;
    await query(sql, [ticketId]);
  }
}

module.exports = { TicketRepository };
