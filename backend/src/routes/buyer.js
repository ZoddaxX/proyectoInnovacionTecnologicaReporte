const express = require('express');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../db');

const router = express.Router();

const VALID_REASONS = ['wrong_size', 'defective', 'not_as_described', 'other'];

router.get('/order/:orderNumber', async (req, res) => {
  try {
    const orders = await sequelize.query(`
      SELECT o.id, o.order_number, o.buyer_name, o.created_at,
             s.name AS store_name, s.return_policy_days
      FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE o.order_number = $1
    `, { bind: [req.params.orderNumber.trim().toUpperCase()], type: QueryTypes.SELECT });

    if (!orders.length) {
      return res.json({ success: false, error: 'Pedido no encontrado. Verifica el número e intenta de nuevo.' });
    }

    const order = orders[0];

    const items = await sequelize.query(`
      SELECT oi.id, pv.size, pv.color,
             p.name AS product_name, p.emoji_icon,
             r.id AS return_id, r.status AS return_status, r.return_code
      FROM order_items oi
      JOIN product_variants pv ON pv.id = oi.product_variant_id
      JOIN products p          ON p.id  = pv.product_id
      LEFT JOIN returns r       ON r.order_item_id = oi.id
      WHERE oi.order_id = $1
    `, { bind: [order.id], type: QueryTypes.SELECT });

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/returns', async (req, res) => {
  try {
    const { order_item_id, reason, comment, buyer_name } = req.body;

    if (!order_item_id || !reason || !buyer_name?.trim()) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }
    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ success: false, error: 'Motivo de devolución inválido' });
    }

    const items = await sequelize.query(`
      SELECT oi.id, o.store_id
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = $1
    `, { bind: [order_item_id], type: QueryTypes.SELECT });

    if (!items.length) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    const existing = await sequelize.query(`
      SELECT id FROM returns WHERE order_item_id = $1
    `, { bind: [order_item_id], type: QueryTypes.SELECT });

    if (existing.length) {
      return res.status(409).json({ success: false, error: 'Ya existe una devolución para este artículo' });
    }

    const returnCode = 'RIQ-' + Date.now().toString(36).toUpperCase().slice(-6);

    const result = await sequelize.query(`
      INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING id, return_code, status, created_at
    `, {
      bind: [
        order_item_id,
        buyer_name.trim(),
        items[0].store_id,
        reason,
        comment?.trim() || null,
        returnCode,
      ],
      type: QueryTypes.SELECT,
    });

    await sequelize.query(`
      INSERT INTO return_events (return_id, description) VALUES ($1, $2)
    `, {
      bind: [result[0].id, 'Solicitud de devolución enviada por el comprador'],
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: { return_code: result[0].return_code } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.get('/returns/:returnCode', async (req, res) => {
  try {
    const returns = await sequelize.query(`
      SELECT r.id, r.return_code, r.reason, r.comment, r.status,
             r.buyer_name, r.created_at, r.updated_at,
             p.name AS product_name, p.emoji_icon,
             pv.size, pv.color,
             s.name AS store_name, s.return_policy_days
      FROM returns r
      JOIN order_items oi      ON oi.id = r.order_item_id
      JOIN product_variants pv ON pv.id = oi.product_variant_id
      JOIN products p          ON p.id  = pv.product_id
      JOIN stores s            ON s.id  = r.store_id
      WHERE r.return_code = $1
    `, { bind: [req.params.returnCode.trim().toUpperCase()], type: QueryTypes.SELECT });

    if (!returns.length) {
      return res.json({ success: false, error: 'Código de devolución no encontrado' });
    }

    const events = await sequelize.query(`
      SELECT description, created_at
      FROM return_events
      WHERE return_id = $1
      ORDER BY created_at ASC
    `, { bind: [returns[0].id], type: QueryTypes.SELECT });

    res.json({ success: true, data: { ...returns[0], events } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
