require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const ticketsRouter  = require('./Controllers/TicketsController');
const usersRouter    = require('./Controllers/UsersController');
const commentsRouter = require('./Controllers/CommentsController');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Micro-Soporte L1/L2 API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/users',    usersRouter);
app.use('/api/tickets',  ticketsRouter);
app.use('/api/comments', commentsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.info(`[Server] Micro-Soporte API running on http://localhost:${PORT}`);
  console.info(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
