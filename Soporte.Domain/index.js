// Entities
const { Customer } = require('./Entities/Customer');
const { Product } = require('./Entities/Product');
const { User, VALID_ROLES } = require('./Entities/User');
const { Ticket, VALID_STATUSES, VALID_LEVELS } = require('./Entities/Ticket');
const { Comment } = require('./Entities/Comment');

// Repository Interfaces
const { ICustomerRepository } = require('./Interfaces/ICustomerRepository');
const { IProductRepository } = require('./Interfaces/IProductRepository');
const { IUserRepository } = require('./Interfaces/IUserRepository');
const { ITicketRepository } = require('./Interfaces/ITicketRepository');
const { ICommentRepository } = require('./Interfaces/ICommentRepository');

module.exports = {
  Customer,
  Product,
  User,
  Ticket,
  Comment,
  VALID_ROLES,
  VALID_STATUSES,
  VALID_LEVELS,
  ICustomerRepository,
  IProductRepository,
  IUserRepository,
  ITicketRepository,
  ICommentRepository,
};
