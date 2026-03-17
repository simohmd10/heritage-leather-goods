const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Seed admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password_hash, role)
  VALUES (?, ?, ?, ?)
`);
insertUser.run('Admin User', 'admin@heritageleather.com', adminPassword, 'admin');
insertUser.run('Test Customer', 'customer@example.com', bcrypt.hashSync('password123', 10), 'customer');

// Seed products (matching the existing frontend product data)
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (slug, name, description, price, category, images, featured, bestseller, personalizable, stock_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const products = [
  {
    slug: 'classic-bifold-wallet',
    name: 'Classic Bifold Wallet',
    description: 'Crafted from full-grain vegetable-tanned leather, this timeless bifold wallet develops a rich patina over years of use. Features 6 card slots, 2 bill compartments, and an ID window. Hand-stitched with waxed thread for exceptional durability. Each wallet is unique, showcasing the natural grain and character of the leather.',
    price: 120,
    category: 'wallets',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
    ]),
    featured: 1,
    bestseller: 1,
    personalizable: 1,
    stock_count: 50
  },
  {
    slug: 'heritage-messenger-bag',
    name: 'Heritage Messenger Bag',
    description: 'A modern classic built for the everyday carry of the discerning professional. Full-grain leather with brass hardware, this messenger bag features a padded 15" laptop sleeve, multiple interior pockets, and an adjustable shoulder strap. The leather will age beautifully, developing unique character with daily use.',
    price: 395,
    category: 'bags',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
    ]),
    featured: 1,
    bestseller: 1,
    personalizable: 1,
    stock_count: 25
  },
  {
    slug: 'artisan-dress-belt',
    name: 'Artisan Dress Belt',
    description: 'Cut from a single piece of full-grain leather, this dress belt is finished with a solid brass buckle. Available in widths of 1" and 1.25", it pairs perfectly with business or formal attire. The natural vegetable tanning process ensures the belt will last for decades with proper care.',
    price: 85,
    category: 'belts',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
      'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=800'
    ]),
    featured: 1,
    bestseller: 0,
    personalizable: 1,
    stock_count: 75
  },
  {
    slug: 'leather-key-organizer',
    name: 'Leather Key Organizer',
    description: 'End the jangling and bulge in your pocket. This precision-engineered key organizer holds 2-7 keys in a compact, organized stack. Made from thick, durable vegetable-tanned leather with stainless steel hardware. Your keys will be instantly accessible while taking up minimal space.',
    price: 45,
    category: 'accessories',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800'
    ]),
    featured: 0,
    bestseller: 1,
    personalizable: 1,
    stock_count: 100
  },
  {
    slug: 'slim-card-holder',
    name: 'Slim Card Holder',
    description: 'For those who prefer minimalist carry, this slim card holder holds 4-8 cards and a few bills, all in an ultra-thin profile. The elastic band keeps cards secure while allowing quick access. Made from the finest full-grain leather available.',
    price: 65,
    category: 'wallets',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'
    ]),
    featured: 0,
    bestseller: 0,
    personalizable: 1,
    stock_count: 80
  },
  {
    slug: 'weekender-duffle',
    name: 'Weekender Duffle',
    description: 'The perfect companion for weekend getaways and short business trips. Spacious main compartment with a separate shoe compartment, multiple interior pockets, and a trolley sleeve. The waxed canvas exterior with full-grain leather accents makes this bag as durable as it is stylish.',
    price: 550,
    category: 'bags',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
    ]),
    featured: 1,
    bestseller: 0,
    personalizable: 0,
    stock_count: 15
  }
];

for (const product of products) {
  insertProduct.run(
    product.slug, product.name, product.description, product.price,
    product.category, product.images, product.featured, product.bestseller,
    product.personalizable, product.stock_count
  );
}

// Seed sample reviews
const insertReview = db.prepare(`
  INSERT OR IGNORE INTO reviews (product_id, user_id, rating, title, body)
  VALUES (?, ?, ?, ?, ?)
`);
const customerUser = db.prepare('SELECT id FROM users WHERE email = ?').get('customer@example.com');
if (customerUser) {
  insertReview.run(1, customerUser.id, 5, 'Exceptional quality', 'Best wallet I have ever owned. The leather is buttery smooth and the stitching is flawless. Highly recommend!');
  insertReview.run(2, customerUser.id, 5, 'Worth every penny', 'This bag has survived 2 years of daily use and still looks amazing. The leather has developed a beautiful patina.');
}

console.log('Database seeded successfully!');
console.log('Admin: admin@heritageleather.com / admin123');
console.log('Customer: customer@example.com / password123');
