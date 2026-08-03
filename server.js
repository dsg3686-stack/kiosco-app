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
    const result = await pool.query('SELECT nombre, costo, precio, (precio - costo) AS ganancia FROM productos');
    
    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Lista de Productos - Kiosco</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f6f9;
                  margin: 0;
                  padding: 40px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                  color: #2c3e50;
                  text-align: center;
                  margin-bottom: 20px;
              }
              ul {
                  list-style-type: none;
                  padding: 0;
              }
              li {
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  margin-bottom: 10px;
                  border-left: 5px solid #27ae60;
                  border-radius: 4px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }
              .nombre {
                  font-weight: bold;
                  color: #34495e;
              }
              .detalles {
                  color: #7f8c8d;
                  font-size: 14px;
              }
              .ganancia {
                  color: #27ae60;
                  font-weight: bold;
              }
              .btn-volver {
                  display: block;
                  text-align: center;
                  margin-top: 25px;
                  color: #2980b9;
                  text-decoration: none;
                  font-weight: bold;
              }
              .btn-volver:hover {
                  text-decoration: underline;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Lista de Productos</h2>
              <ul>
    `;

    if (result.rows.length === 0) {
      html += '<p style="text-align: center; color: #7f8c8d;">No hay productos cargados todavía.</p>';
    } else {
      result.rows.forEach(p => {
        html += `
          <li>
              <span class="nombre">${p.nombre}</span>
              <span class="detalles">Costo: $${p.costo} | Precio: $${p.precio}</span>
              <span class="ganancia">Ganancia: $${p.ganancia}</span>
          </li>
        `;
      });
    }

    html += `
              </ul>
              <a href="/" class="btn-volver">Volver a cargar producto</a>
          </div>
      </body>
      </html>
    `;

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

app.get('/borrar-todo', async (req, res) => {
    try {
        await pool.query('DELETE FROM productos');
        res.send('¡Listo! Todos los productos de prueba fueron borrados.');
    } catch (err) {
        console.error(err);
        res.send('Hubo un error al borrar los datos.');
    }
});
