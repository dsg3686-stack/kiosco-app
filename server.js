const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    costo DECIMAL(10,2),
    precio DECIMAL(10,2)
  )
`).catch(err => console.error("Error al crear tabla:", err));
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    let html = '<h2>Lista de Productos</h2><ul>';
    result.rows.forEach(p => {
      html += `<li>${p.nombre} - Costo: $${p.costo} - Precio: $${p.precio}</li>`;
    });
    html += '</ul><br><a href="/">Volver a cargar producto</a>';
    res.send(html);
  } catch (err) {
    console.error(err);
    res.send('Error al obtener productos');
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/guardar-producto', async (req, res) => {
  const { nombre, costo, precio } = req.body;
  try {
    await pool.query(
      'INSERT INTO productos (nombre, costo, precio) VALUES ($1, $2, $3)',
      [nombre, costo, precio]
    );
    res.send('¡Producto guardado con éxito en la base de datos!');
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err);
    res.send('Error al guardar el producto: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
