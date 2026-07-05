const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../db');
const { QueryTypes } = require('sequelize');
const router = express.Router();

const VALID_STATUSES = ['pending', 'reviewing', 'approved', 'rejected'];

async function getStoreId(userId) {
  const rows = await sequelize.query(
    'SELECT id FROM stores WHERE seller_id = $1 LIMIT 1',
    { bind: [userId], type: QueryTypes.SELECT }
  );
  return rows[0]?.id ?? null;
}

// Must be declared before /:id to avoid route conflict
router.get('/alerts', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const alerts = await sequelize.query(
      `SELECT
         p.id,
         p.name,
         p.emoji_icon,
         p.ai_report,
         COUNT(r.id)                                                          AS total_returns,
         COUNT(CASE WHEN r.reason = 'wrong_size' THEN 1 END)                 AS wrong_size,
         COUNT(CASE WHEN r.reason = 'defective' THEN 1 END)                  AS defective,
         COUNT(CASE WHEN r.reason = 'not_as_described' THEN 1 END)           AS not_as_described,
         COUNT(CASE WHEN r.reason = 'other' THEN 1 END)                      AS other
       FROM products p
       JOIN product_variants pv ON pv.product_id = p.id
       JOIN order_items oi      ON oi.product_variant_id = pv.id
       JOIN returns r           ON r.order_item_id = oi.id
       WHERE r.store_id = $1
         AND r.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY p.id, p.name, p.emoji_icon
       HAVING COUNT(r.id) > 5
       ORDER BY total_returns DESC`,
      { bind: [storeId], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: alerts });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const { status } = req.query;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' });
    }

    let query = `
      SELECT
        r.*,
        p.id   AS product_id,
        p.name AS product_name,
        p.emoji_icon,
        pv.size,
        pv.color,
        o.order_number
      FROM returns r
      JOIN order_items oi      ON oi.id = r.order_item_id
      JOIN product_variants pv ON pv.id = oi.product_variant_id
      JOIN products p          ON p.id = pv.product_id
      JOIN orders o            ON o.id = oi.order_id
      WHERE r.store_id = $1
    `;
    const bind = [storeId];
    if (status) {
      query += ' AND r.status = $2';
      bind.push(status);
    }
    query += ' ORDER BY r.created_at DESC';

    const returns = await sequelize.query(query, { bind, type: QueryTypes.SELECT });
    res.json({ success: true, data: returns });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const returns = await sequelize.query(
      `SELECT
         r.*,
         p.id   AS product_id,
         p.name AS product_name,
         p.emoji_icon,
         pv.size,
         pv.color,
         o.order_number
       FROM returns r
       JOIN order_items oi      ON oi.id = r.order_item_id
       JOIN product_variants pv ON pv.id = oi.product_variant_id
       JOIN products p          ON p.id = pv.product_id
       JOIN orders o            ON o.id = oi.order_id
       WHERE r.id = $1 AND r.store_id = $2`,
      { bind: [req.params.id, storeId], type: QueryTypes.SELECT }
    );
    const ret = returns[0];
    if (!ret) return res.status(404).json({ success: false, error: 'Devolución no encontrada' });

    const events = await sequelize.query(
      'SELECT * FROM return_events WHERE return_id = $1 ORDER BY created_at ASC',
      { bind: [req.params.id], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { ...ret, events } });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const storeId = await getStoreId(req.user.id);
    if (!storeId) return res.status(404).json({ success: false, error: 'Sin tienda' });

    const { status, comment } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' });
    }

    const updated = await sequelize.query(
      'UPDATE returns SET status = $1, updated_at = NOW() WHERE id = $2 AND store_id = $3 RETURNING id',
      { bind: [status, req.params.id, storeId], type: QueryTypes.SELECT }
    );
    if (!updated[0]) return res.status(404).json({ success: false, error: 'Devolución no encontrada' });

    const statusLabels = {
      approved:  'Devolución aprobada',
      rejected:  'Devolución rechazada',
      reviewing: 'Revisión iniciada',
      pending:   'Devuelta a pendiente',
    };
    const description = comment?.trim()
      ? `${statusLabels[status]}: ${comment.trim()}`
      : statusLabels[status];

    await sequelize.query(
      'INSERT INTO return_events (return_id, description) VALUES ($1, $2)',
      { bind: [req.params.id, description] }
    );

    res.json({ success: true, data: { status } });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
