const { LoginUseCase }           = require('./UseCases/LoginUseCase');
const { CrearTicketUseCase }     = require('./UseCases/CrearTicketUseCase');
const { EscalarTicketUseCase }   = require('./UseCases/EscalarTicketUseCase');
const { CerrarTicketUseCase }    = require('./UseCases/CerrarTicketUseCase');
const { CrearComentarioUseCase } = require('./UseCases/CrearComentarioUseCase');
const { IAuthService }           = require('./Services/IAuthService');

module.exports = {
  LoginUseCase,
  CrearTicketUseCase,
  EscalarTicketUseCase,
  CerrarTicketUseCase,
  CrearComentarioUseCase,
  IAuthService,
};
