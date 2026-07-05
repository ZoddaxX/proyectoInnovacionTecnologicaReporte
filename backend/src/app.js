require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no definido en .env');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:80', 'http://localhost'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/stores',   require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
app.use('/api/returns',  require('./routes/returns'));
app.use('/api/buyer',    require('./routes/buyer'));

const PORT = process.env.PORT || 3002;

sequelize.authenticate()
  .then(async () => {
    console.log('DB conectada');
    try {
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_report JSONB');
      console.log('Migración automática: ai_report verificada.');
    } catch (e) {
      console.log('Nota: no se pudo verificar la migración ai_report.', e.message);
    }
    app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error al conectar DB:', err.message);
    process.exit(1);
  });
