const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../db');
const { QueryTypes } = require('sequelize');
const router = express.Router();

async function getStoreId(userId) {
  const rows = await sequelize.query(
    'SELECT id FROM stores WHERE seller_id = $1 LIMIT 1',
    { bind: [userId], type: QueryTypes.SELECT }
  );
  return rows[0]?.id ?? null;
}

router.get('/', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const products = await sequelize.query(
      `SELECT p.*,
        COALESCE(SUM(v.stock), 0)                            AS total_stock,
        COUNT(v.id)                                          AS variant_count,
        COUNT(CASE WHEN v.stock <= 5 THEN 1 END)             AS low_stock_variants
       FROM products p
       LEFT JOIN product_variants v ON v.product_id = p.id
       WHERE p.store_id = $1 AND p.is_active = true
       GROUP BY p.id
       ORDER BY p.id`,
      { bind: [storeId], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: products });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const name = (req.body.name || '').trim();
    const sku = (req.body.sku || '').trim();
    const emojiIcon = req.body.emoji_icon || '📦';

    if (!name || !sku) {
      return res.status(400).json({ success: false, error: 'Nombre y SKU requeridos' });
    }

    const result = await sequelize.query(
      'INSERT INTO products (store_id, name, sku, emoji_icon) VALUES ($1,$2,$3,$4) RETURNING *',
      { bind: [storeId, name, sku, emojiIcon], type: QueryTypes.SELECT }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const products = await sequelize.query(
      'SELECT * FROM products WHERE id = $1 AND store_id = $2',
      { bind: [req.params.id, storeId], type: QueryTypes.SELECT }
    );
    const product = products[0];
    if (!product) return res.status(404).json({ success: false, error: 'Producto no encontrado' });

    const variants = await sequelize.query(
      'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id',
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { ...product, variants } });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.put('/:id/variants/:variantId', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const stock = parseInt(req.body.stock);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ success: false, error: 'Stock debe ser un número no negativo' });
    }

    const result = await sequelize.query(
      `UPDATE product_variants pv
       SET stock = $1
       FROM products p
       WHERE pv.id = $2
         AND pv.product_id = $3
         AND pv.product_id = p.id
         AND p.store_id = $4
       RETURNING pv.*`,
      { bind: [stock, req.params.variantId, req.params.id, storeId], type: QueryTypes.SELECT }
    );
    if (!result[0]) return res.status(404).json({ success: false, error: 'Variante no encontrada' });
    res.json({ success: true, data: result[0] });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.put('/:id/ai-report', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const aiReport = req.body;
    if (!aiReport) {
      return res.status(400).json({ success: false, error: 'Reporte requerido' });
    }

    const result = await sequelize.query(
      `UPDATE products 
       SET ai_report = $1
       WHERE id = $2 AND store_id = $3
       RETURNING *`,
      { bind: [JSON.stringify(aiReport), req.params.id, storeId], type: QueryTypes.SELECT }
    );

    if (!result[0]) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    res.json({ success: true, data: result[0].ai_report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
