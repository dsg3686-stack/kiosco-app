const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear tablas en la base de datos si no existen
pool.query(`
  CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    costo DECIMAL(10,2),
    precio DECIMAL(10,2)
  );

  CREATE TABLE IF NOT EXISTS cuentas_clientes (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(100),
    detalle VARCHAR(255),
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pagado BOOLEAN DEFAULT FALSE
  );
`).catch(err => console.error("Error al crear tablas:", err));

// 1. Obtener productos y cuentas de clientes
app.get('/api/datos', async (req, res) => {
  try {
    const productos = await pool.query('SELECT * FROM productos');
    const cuentas = await pool.query('SELECT * FROM cuentas_clientes ORDER BY fecha DESC');
    res.json({ productos: productos.rows, cuentas: cuentas.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// 2. Guardar nuevo producto
app.post('/api/productos', async (req, res) => {
  const { nombre, costo, precio } = req.body;
  try {
    const nuevo = await pool.query(
      'INSERT INTO productos (nombre, costo, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, costo, precio]
    );
    res.json(nuevo.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar producto' });
  }
});

// 3. Borrar producto
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar producto' });
  }
});

// 4. Registrar un fiado/consumo diario para un cliente
app.post('/api/cuentas', async (req, res) => {
  const { cliente, detalle, monto } = req.body;
  try {
    const nuevo = await pool.query(
      'INSERT INTO cuentas_clientes (cliente, detalle, monto, pagado) VALUES ($1, $2, $3, FALSE) RETURNING *',
      [cliente, detalle, monto]
    );
    res.json(nuevo.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar consumo' });
  }
});

// 5. Marcar la cuenta de un cliente como pagada (o borrar sus deudas del mes)
app.put('/api/cuentas/pagar/:cliente', async (req, res) => {
  const { cliente } = req.params;
  try {
    await pool.query('UPDATE cuentas_clientes SET pagado = TRUE WHERE cliente = $1', [cliente]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

// 6. Borrar un registro individual de la cuenta
app.delete('/api/cuentas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cuentas_clientes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar registro' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
