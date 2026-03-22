const { query, getClient, closePool, pool } = require('./Database/connection');

const { TicketRepository }  = require('./Repositories/TicketRepository');
const { UserRepository }    = require('./Repositories/UserRepository');
const { CommentRepository } = require('./Repositories/CommentRepository');

const { AuthService }      = require('./Services/AuthService');
const { TicketPdfService } = require('./Services/TicketPdfService');

module.exports = {
  query,
  getClient,
  closePool,
  pool,
  TicketRepository,
  UserRepository,
  CommentRepository,
  AuthService,
  TicketPdfService,
};
