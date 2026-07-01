// Rutas montadas en /api/products
// GET / → L1, L2 (lista de productos activos, para elegir al crear un ticket)
const { Router } = require('express');
const { authenticate } = require('../Middleware/authMiddleware');
const { ProductRepository } = require('../../Soporte.Infrastructure/Repositories/ProductRepository');

const productRepository = new ProductRepository();

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  try {
    const products = await productRepository.findAll();
    return res.status(200).json({ data: products });
  } catch (err) {
    console.error('[ProductsController] GET /:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
