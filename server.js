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
