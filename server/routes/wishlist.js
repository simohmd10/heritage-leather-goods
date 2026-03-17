const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/wishlist
router.get('/', (req, res) => {
  const items = db.prepare(`
    SELECT w.id, w.created_at, p.id as product_id, p.slug, p.name, p.price, p.images, p.category, p.in_stock
    FROM wishlist w JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.user.id).map(item => ({
    ...item,
    images: JSON.parse(item.images || '[]'),
    in_stock: Boolean(item.in_stock)
  }));
  res.json(items);
});

// POST /api/wishlist/:productId
router.post('/:productId', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  try {
    db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, product.id);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch {
    res.status(409).json({ error: 'Already in wishlist' });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
