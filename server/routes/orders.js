const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HLG-${y}${m}${d}-${rand}`;
}

// POST /api/orders - Create a new order
router.post('/', optionalAuth, (req, res) => {
  const { items, shippingAddress, guestEmail, guestName, notes, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  // Validate items and calculate totals
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?')
      .get(item.productId || item.id, item.productSlug || item.slug || '');

    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
    }
    if (!product.in_stock || product.stock_count < item.quantity) {
      return res.status(400).json({ error: `Product "${product.name}" is out of stock` });
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    validatedItems.push({ product, quantity: item.quantity, engraving: item.engraving || null });
  }

  const shipping = subtotal >= 250 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  // Create order in transaction
  const createOrder = db.transaction(() => {
    const orderNumber = generateOrderNumber();
    const result = db.prepare(`
      INSERT INTO orders (order_number, user_id, guest_email, guest_name, subtotal, shipping, tax, total, shipping_address, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNumber,
      req.user?.id || null,
      req.user ? null : (guestEmail || null),
      req.user ? null : (guestName || null),
      subtotal, shipping, tax, total,
      JSON.stringify(shippingAddress),
      paymentMethod || 'card',
      notes || null
    );

    const orderId = result.lastInsertRowid;

    for (const { product, quantity, engraving } of validatedItems) {
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, product_slug, price, quantity, engraving)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(orderId, product.id, product.name, product.slug, product.price, quantity, engraving);

      // Update stock
      db.prepare('UPDATE products SET stock_count = stock_count - ? WHERE id = ?')
        .run(quantity, product.id);
      db.prepare('UPDATE products SET in_stock = 0 WHERE id = ? AND stock_count <= 0')
        .run(product.id);
    }

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });

  const order = createOrder();
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

  res.status(201).json({
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items: orderItems
  });
});

// GET /api/orders - Get user's orders (authenticated)
router.get('/', authenticate, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const result = orders.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, shipping_address: JSON.parse(o.shipping_address), items };
  });

  res.json(result);
});

// GET /api/orders/:id - Get specific order
router.get('/:id', optionalAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
    .get(req.params.id, req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Allow access if authenticated user owns the order, or if it's a guest order
  if (req.user && order.user_id && order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, shipping_address: JSON.parse(order.shipping_address), items });
});

module.exports = router;
