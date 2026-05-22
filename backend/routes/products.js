const express     = require('express');
const multer      = require('multer');
const cloudinary  = require('cloudinary').v2;
const { client }  = require('../database/db');
const requireAuth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router  = express.Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files allowed'));
    cb(null, true);
  },
});

function parse(row) {
  if (!row) return null;
  return {
    ...row,
    tags:        JSON.parse(row.tags        || '[]'),
    variantMap:  JSON.parse(row.variant_map || '{}'),
    inStock:     row.in_stock === 1,
    imgBg:       row.img_bg,
    variantKey:  row.variant_key,
    servingSize: row.serving_size,
  };
}

function bindParams(p) {
  return [
    p.name, p.category, p.sub || null, p.flavor || 'Unflavored',
    p.weight || null, p.servings ? Number(p.servings) : 0,
    p.servingSize || null, p.protein ? Number(p.protein) : null,
    Number(p.price) || 0, p.badge || null, p.inStock !== false ? 1 : 0,
    p.img || null, p.imgBg || '#f0ede4', p.sku || null, p.description || null,
    JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
    p.variantKey || null,
    JSON.stringify(typeof p.variantMap === 'object' ? p.variantMap : {}),
  ];
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql    = 'SELECT * FROM products';
    const args = [];
    const where = [];

    if (category && category !== 'All') { where.push('category = ?'); args.push(category); }
    if (search) {
      where.push('(name LIKE ? OR sku LIKE ? OR description LIKE ?)');
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY id ASC';

    const { rows } = await client.execute({ sql, args });
    res.json(rows.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/meta/stats
router.get('/meta/stats', async (req, res) => {
  try {
    const [total, inStock, categories, recent] = await Promise.all([
      client.execute('SELECT COUNT(*) as n FROM products'),
      client.execute('SELECT COUNT(*) as n FROM products WHERE in_stock = 1'),
      client.execute('SELECT COUNT(DISTINCT category) as n FROM products'),
      client.execute('SELECT COUNT(*) as n FROM products WHERE created_at >= datetime("now", "-7 days")'),
    ]);
    res.json({
      total:      Number(total.rows[0].n),
      inStock:    Number(inStock.rows[0].n),
      categories: Number(categories.rows[0].n),
      recent:     Number(recent.rows[0].n),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/meta/categories
router.get('/meta/categories', async (req, res) => {
  try {
    const { rows } = await client.execute('SELECT * FROM categories ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await client.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [req.params.id] });
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(parse(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', requireAuth, async (req, res) => {
  try {
    const result = await client.execute({
      sql: `INSERT INTO products
        (name,category,sub,flavor,weight,servings,serving_size,protein,price,badge,in_stock,img,img_bg,sku,description,tags,variant_key,variant_map)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: bindParams(req.body),
    });
    const { rows } = await client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [Number(result.lastInsertRowid)],
    });
    res.status(201).json(parse(rows[0]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const result = await client.execute({
      sql: `UPDATE products SET
        name=?,category=?,sub=?,flavor=?,weight=?,servings=?,serving_size=?,protein=?,price=?,
        badge=?,in_stock=?,img=?,img_bg=?,sku=?,description=?,tags=?,variant_key=?,variant_map=?,
        updated_at=CURRENT_TIMESTAMP
        WHERE id=?`,
      args: [...bindParams(req.body), req.params.id],
    });
    if (!result.rowsAffected) return res.status(404).json({ error: 'Product not found' });
    const { rows } = await client.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [req.params.id] });
    res.json(parse(rows[0]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] });
    if (!result.rowsAffected) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/upload/image
router.post('/upload/image', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  try {
    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'toc-products' },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      stream.end(req.file.buffer);
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
