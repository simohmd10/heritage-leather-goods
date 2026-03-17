const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

function parseProduct(p) {
  if (!p) return null;
  return { ...p, images: JSON.parse(p.images || '[]'), featured: Boolean(p.featured), bestseller: Boolean(p.bestseller), personalizable: Boolean(p.personalizable), in_stock: Boolean(p.in_stock) };
}

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total), 0) as value FROM orders WHERE payment_status != 'failed'`).get();
  const totalOrders = db.prepare('SELECT COUNT(*) as value FROM orders').get();
  const totalProducts = db.prepare('SELECT COUNT(*) as value FROM products').get();
  const totalCustomers = db.prepare(`SELECT COUNT(*) as value FROM users WHERE role = 'customer'`).get();
  const pendingOrders = db.prepare(`SELECT COUNT(*) as value FROM orders WHERE status = 'pending'`).get();
  const lowStockProducts = db.prepare('SELECT COUNT(*) as value FROM products WHERE stock_count <= 5').get();

  // Revenue by month (last 6 months)
  const revenueByMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
           COALESCE(SUM(total), 0) as revenue,
           COUNT(*) as orders
    FROM orders
    WHERE created_at >= date('now', '-6 months') AND payment_status != 'failed'
    GROUP BY month ORDER BY month
  `).all();

  // Top products by order count
  const topProducts = db.prepare(`
    SELECT oi.product_name, oi.product_slug, SUM(oi.quantity) as units_sold,
           SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    GROUP BY oi.product_id
    ORDER BY units_sold DESC LIMIT 5
  `).all();

  // Recent orders
  const recentOrders = db.prepare(`
    SELECT o.*, u.name as customer_name
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 5
  `).all().map(o => ({ ...o, shipping_address: JSON.parse(o.shipping_address) }));

  res.json({
    stats: {
      totalRevenue: totalRevenue.value,
      totalOrders: totalOrders.value,
      totalProducts: totalProducts.value,
      totalCustomers: totalCustomers.value,
      pendingOrders: pendingOrders.value,
      lowStockProducts: lowStockProducts.value
    },
    revenueByMonth,
    topProducts,
    recentOrders
  });
});

// GET /api/admin/orders
router.get('/orders', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1`;
  const params = [];

  if (status) { query += ' AND o.status = ?'; params.push(status); }
  query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const orders = db.prepare(query).all(...params).map(o => ({
    ...o,
    shipping_address: JSON.parse(o.shipping_address),
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
  }));
  const total = db.prepare(`SELECT COUNT(*) as c FROM orders${status ? ' WHERE status = ?' : ''}`).get(...(status ? [status] : []));

  res.json({ orders, total: total.c, page: parseInt(page), limit: parseInt(limit) });
});

// PUT /api/admin/orders/:id
router.put('/orders/:id', (req, res) => {
  const { status, payment_status } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE orders SET status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status || order.status, payment_status || order.payment_status, order.id);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  res.json({ ...updated, shipping_address: JSON.parse(updated.shipping_address) });
});

// GET /api/admin/products
router.get('/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all().map(parseProduct);
  res.json(products);
});

// POST /api/admin/products
router.post('/products', (req, res) => {
  const { slug, name, description, price, category, images, in_stock, stock_count, featured, bestseller, personalizable } = req.body;
  if (!slug || !name || !price || !category) {
    return res.status(400).json({ error: 'slug, name, price and category are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO products (slug, name, description, price, category, images, in_stock, stock_count, featured, bestseller, personalizable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(slug, name, description || '', price, category, JSON.stringify(images || []),
      in_stock ? 1 : 1, stock_count || 100, featured ? 1 : 0, bestseller ? 1 : 0, personalizable ? 1 : 0);

    const product = parseProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Product with this slug already exists' });
    }
    throw err;
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req, res) => {
  const { name, description, price, category, images, in_stock, stock_count, featured, bestseller, personalizable } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, category=?, images=?,
      in_stock=?, stock_count=?, featured=?, bestseller=?, personalizable=?
    WHERE id=?
  `).run(
    name || product.name, description ?? product.description, price || product.price,
    category || product.category, JSON.stringify(images || JSON.parse(product.images)),
    in_stock !== undefined ? (in_stock ? 1 : 0) : product.in_stock,
    stock_count !== undefined ? stock_count : product.stock_count,
    featured !== undefined ? (featured ? 1 : 0) : product.featured,
    bestseller !== undefined ? (bestseller ? 1 : 0) : product.bestseller,
    personalizable !== undefined ? (personalizable ? 1 : 0) : product.personalizable,
    product.id
  );

  res.json(parseProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(product.id)));
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(product.id);
  res.json({ message: 'Product deleted' });
});

// GET /api/admin/customers
router.get('/customers', (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT u.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
    FROM users u LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'`;
  const params = [];

  if (search) {
    query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const customers = db.prepare(query).all(...params).map(({ password_hash, ...c }) => c);
  const total = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'customer'`).get();
  res.json({ customers, total: total.c });
});

// GET /api/admin/messages
router.get('/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json(messages);
});

// PUT /api/admin/messages/:id
router.put('/messages/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Updated' });
});

module.exports = router;
