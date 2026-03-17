const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function parseProduct(p) {
  if (!p) return null;
  return {
    ...p,
    images: JSON.parse(p.images || '[]'),
    featured: Boolean(p.featured),
    bestseller: Boolean(p.bestseller),
    personalizable: Boolean(p.personalizable),
    in_stock: Boolean(p.in_stock)
  };
}

// GET /api/products
router.get('/', (req, res) => {
  const { category, featured, bestseller, search, limit, offset } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    query += ' AND category = ?'; params.push(category);
  }
  if (featured === 'true') {
    query += ' AND featured = 1';
  }
  if (bestseller === 'true') {
    query += ' AND bestseller = 1';
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY featured DESC, bestseller DESC, created_at DESC';

  if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
  if (offset) { query += ' OFFSET ?'; params.push(parseInt(offset)); }

  const products = db.prepare(query).all(...params).map(parseProduct);
  const total = db.prepare(
    query.replace('SELECT *', 'SELECT COUNT(*) as count').replace(/LIMIT \?.*/, '')
  ).get(...params.slice(0, params.length - (limit ? 1 : 0) - (offset ? 1 : 0)));

  res.json({ products, total: total?.count || products.length });
});

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const product = parseProduct(
    db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug)
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Get reviews
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM reviews r JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(product.id);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  res.json({ ...product, reviews, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', authenticate, (req, res) => {
  const { rating, title, body } = req.body;
  const productId = parseInt(req.params.id);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    db.prepare(
      'INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)'
    ).run(productId, req.user.id, rating, title || null, body || null);

    const review = db.prepare(`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.user_id = ?
    `).get(productId, req.user.id);

    res.status(201).json(review);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }
    throw err;
  }
});

// GET /api/products/:id/related
router.get('/:id/related', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) ||
                  db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const related = db.prepare(
    'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4'
  ).all(product.category, product.id).map(parseProduct);

  res.json(related);
});

module.exports = router;
