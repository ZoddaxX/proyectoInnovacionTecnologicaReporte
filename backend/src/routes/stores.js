const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../db');
const { QueryTypes } = require('sequelize');
const router = express.Router();

async function getSellerStore(sellerId) {
  const rows = await sequelize.query(
    'SELECT * FROM stores WHERE seller_id = $1 LIMIT 1',
    { bind: [sellerId], type: QueryTypes.SELECT }
  );
  return rows[0] || null;
}

router.get('/me', auth, async (req, res) => {
  try {
    const store = await getSellerStore(req.user.id);
    if (!store) return res.status(404).json({ success: false, error: 'Sin tienda' });
    res.json({ success: true, data: store });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const existing = await getSellerStore(req.user.id);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Ya tienes una tienda registrada' });
    }

    const name = (req.body.name || '').trim();
    const slug = (req.body.slug || '').trim().toLowerCase();
    const returnPolicyDays = parseInt(req.body.return_policy_days) || 30;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Nombre y slug requeridos' });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ success: false, error: 'Slug solo puede contener letras, números y guiones' });
    }

    const result = await sequelize.query(
      'INSERT INTO stores (seller_id, name, slug, return_policy_days) VALUES ($1,$2,$3,$4) RETURNING *',
      { bind: [req.user.id, name, slug, returnPolicyDays], type: QueryTypes.SELECT }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    if (err.parent?.code === '23505') {
      return res.status(409).json({ success: false, error: 'Ese slug ya está en uso' });
    }
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const slug = (req.body.slug || '').trim().toLowerCase();
    const returnPolicyDays = parseInt(req.body.return_policy_days) || 30;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Nombre y slug requeridos' });
    }

    const result = await sequelize.query(
      'UPDATE stores SET name=$1, slug=$2, return_policy_days=$3 WHERE seller_id=$4 RETURNING *',
      { bind: [name, slug, returnPolicyDays, req.user.id], type: QueryTypes.SELECT }
    );
    if (!result[0]) return res.status(404).json({ success: false, error: 'Sin tienda' });
    res.json({ success: true, data: result[0] });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
