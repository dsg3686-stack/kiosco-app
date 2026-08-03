const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
    console.error(err);
    res.send('Error al guardar el producto');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
