const { ICommentRepository } = require('../../Soporte.Domain/Interfaces/ICommentRepository');
const { Comment } = require('../../Soporte.Domain/Entities/Comment');
const { query } = require('../Database/connection');

class CommentRepository extends ICommentRepository {
  _mapRowToEntity(row) {
    return new Comment(
      row.comment_id,
      row.ticket_id,
      row.user_id,
      row.content,
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
  }

  // Retorna comentarios enriquecidos con authorName y authorRole para mostrar en UI
  async findByTicketId(ticketId) {
    const sql = `
      SELECT
        c.comment_id,
        c.ticket_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        c.deleted_at,
        u.full_name  AS author_name,
        u.role       AS author_role
      FROM comments c
      INNER JOIN users u ON u.user_id = c.user_id
      WHERE c.ticket_id = $1
        AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `;
    const result = await query(sql, [ticketId]);
    return result.rows.map((row) => ({
      ...this._mapRowToEntity(row),
      authorName: row.author_name,
      authorRole: row.author_role,
    }));
  }

  async findById(commentId) {
    const sql = `
      SELECT * FROM comments
      WHERE comment_id = $1
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [commentId]);
    if (result.rows.length === 0) return null;
    return this._mapRowToEntity(result.rows[0]);
  }

  async create(comment) {
    const sql = `
      INSERT INTO comments
        (comment_id, ticket_id, user_id, content)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [
      comment.commentId,
      comment.ticketId,
      comment.userId,
      comment.content,
    ];
    const result = await query(sql, params);
    return this._mapRowToEntity(result.rows[0]);
  }

  async softDelete(commentId) {
    const sql = `
      UPDATE comments
      SET deleted_at = NOW()
      WHERE comment_id = $1
        AND deleted_at IS NULL
    `;
    await query(sql, [commentId]);
  }
}

module.exports = { CommentRepository };
