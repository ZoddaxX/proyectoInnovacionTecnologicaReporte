const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../db');
const { QueryTypes } = require('sequelize');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Contraseña demasiado corta' });
    }

    const users = await sequelize.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      { bind: [email], type: QueryTypes.SELECT }
    );
    const user = users[0];

    const credentialsError = { success: false, error: 'Credenciales incorrectas' };

    if (!user) return res.status(401).json(credentialsError);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json(credentialsError);

    const stores = await sequelize.query(
      'SELECT id FROM stores WHERE seller_id = $1 LIMIT 1',
      { bind: [user.id], type: QueryTypes.SELECT }
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token, hasStore: stores.length > 0, name: user.full_name },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
