// server.js

const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde Angular
const { Pool } = require('pg'); // Importar el driver de PostgreSQL
const app = express();
const port = 3000; // Elige un puerto diferente al de Angular (generalmente 4200)

// Middleware
app.use(cors());
app.use(express.json()); // Para parsear el body de las peticiones JSON

// ----------------------------------------------------
// 1. Configuración de la Conexión a PostgreSQL
// ----------------------------------------------------
const pool = new Pool({
  user: 'postgres', // CAMBIA ESTO
  host: 'localhost',    // O la IP donde esté corriendo PostgreSQL
  database: 'gimnasioLeon', // CAMBIA ESTO
  password: 'DSC2003p', // CAMBIA ESTO
  port: 5433, // Puerto por defecto de PostgreSQL
});

// Probar la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar a PostgreSQL:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error al ejecutar la consulta de prueba', err.stack);
    }
    console.log('Conexión a PostgreSQL exitosa. Hora actual:', result.rows[0].now);
  });
});


// ----------------------------------------------------
// 2. Rutas (Endpoints)
// ----------------------------------------------------
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend del Gimnasio funcionando.');
});



// ----------------------------------------------------
//  CLIENTES 
// ----------------------------------------------------
// Aquí agregaremos las rutas CRUD para Clientes e Inscripciones

app.post('/api/clientes', async (req, res) => {
  console.log("📩 Datos recibidos del frontend:", req.body);

  const { nombre, correo, genero, rol, edad, telefono, direccion, contrasena } = req.body;
  const sexo = genero;

  // Validación mínima
  if (!nombre || !correo || !sexo || !rol || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  // Aquí podrías hashear la contraseña antes de guardarla
  // const hashedPassword = await hashPassword(contrasena);

  // Insertar en la tabla Cliente con rol y contraseña
  const query = `
    INSERT INTO cliente (nombre, correo, sexo, rol, contrasena, fecha_registro, edad, telefono, direccion)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
    RETURNING id_cliente, nombre, correo, rol;`;

  try {
    const result = await pool.query(query, [
      nombre, 
      correo, 
      sexo, 
      rol, 
      contrasena, // o hashedPassword
      edad || null, 
      telefono || null, 
      direccion || null
    ]);

    console.log("✅ Cliente guardado:", result.rows[0]);
    res.status(201).json({ 
      mensaje: 'Cliente registrado exitosamente',
      cliente: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El correo ya está registrado', code: error.code });
    }

    console.error("❌ Error guardando cliente:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ----------------------------------------------------
// INSCRIPCIONES
// ----------------------------------------------------
// ----------------------------------------------------
// POST /api/inscripciones - Crear cliente + inscripción
// ----------------------------------------------------
//Create inscripción junto con el cliente
app.post('/api/inscripciones', async (req, res) => {
  const { nombre, correo, genero, id_membresia, fecha } = req.body;

  if (!nombre || !correo || !genero || !id_membresia || !fecha) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios (nombre, correo, genero, id_membresia, fecha).'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Crear cliente
    const clienteQuery = `
      INSERT INTO cliente (nombre, correo, sexo, fecha_registro)
      VALUES ($1, $2, $3, NOW())
      RETURNING id_cliente;
    `;
    const clienteResult = await client.query(clienteQuery, [
      nombre, correo, genero
    ]);

    const id_cliente = clienteResult.rows[0].id_cliente;

    // 2) Crear inscripción
    const inscripcionQuery = `
      INSERT INTO inscripcion (id_cliente, id_membresia, fecha_inscripcion, estado)
      VALUES ($1, $2, $3, 'ACTIVO')
      RETURNING id_inscripcion;
    `;
    const inscripcionResult = await client.query(inscripcionQuery, [
      id_cliente, id_membresia, fecha
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Inscripción creada exitosamente',
      id_cliente,
      id_inscripcion: inscripcionResult.rows[0].id_inscripcion
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Error en inscripción:", error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'El correo ya está registrado. No se puede repetir.'
      });
    }

    res.status(500).json({
      error: 'Error interno al crear la inscripción',
      detalles: error.message
    });
  } finally {
    client.release();
  }
});

// Obtener todas las inscripciones con detalles
app.get('/inscripciones', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.id_inscripcion,
                c.nombre AS cliente,
                c.correo,
                m.nombre AS membresia,
                m.costo,
                m.duracion_meses,
                i.fecha_inscripcion,
                i.fecha_fin,
                i.estado
            FROM Inscripcion i
            INNER JOIN Cliente c ON i.id_cliente = c.id_cliente
            INNER JOIN Membresia m ON i.id_membresia = m.id_membresia
            ORDER BY i.id_inscripcion DESC;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("❌ Error al obtener inscripciones:", error);
        res.status(500).json({ mensaje: "Error al obtener inscripciones" });
    }
});


// PAGOS 

// Obtener todos los pagos con información relacionada
app.get('/pagos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id_pago,
                c.nombre AS cliente,
                m.nombre AS membresia,
                p.monto,
                p.fecha,
                p.metodo_pago
            FROM Pago p
            INNER JOIN Cliente c ON p.id_cliente = c.id_cliente
            LEFT JOIN Membresia m ON p.id_membresia = m.id_membresia
            ORDER BY p.id_pago DESC;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("❌ Error al obtener pagos:", error);
        res.status(500).json({ mensaje: "Error al obtener pagos" });
    }
});

// Endpoint de login
// LOGIN
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  console.log("🔐 Intento de login:", req.body);

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    // 1. Buscar usuario por correo
    const query = `
      SELECT id_cliente, nombre, correo, contrasena 
      FROM cliente 
      WHERE correo = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const usuario = result.rows[0];

    // 2. Validar contraseña con bcrypt
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!esValida) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    console.log("✅ Login exitoso:", usuario);

    // 3. Respuesta final
    return res.json({
      mensaje: "Login exitoso",
      usuario: {
        id_cliente: usuario.id_cliente,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


// =====================================
//  POST /pagos  -> Registrar un Pago
// =====================================
app.post("/pagos", async (req, res) => {
    const { id_cliente, id_membresia, id_inscripcion, monto, metodo_pago } = req.body;

    try {
        // Validar que el cliente exista
        const clienteExiste = await pool.query(
            "SELECT id_cliente FROM Cliente WHERE id_cliente = $1",
            [id_cliente]
        );

        if (clienteExiste.rowCount === 0) {
            return res.status(400).json({ error: "El cliente no existe" });
        }

        // Validar membresía si se envió
        if (id_membresia) {
            const membresiaExiste = await pool.query(
                "SELECT id_membresia FROM Membresia WHERE id_membresia = $1",
                [id_membresia]
            );

            if (membresiaExiste.rowCount === 0) {
                return res.status(400).json({ error: "La membresía no existe" });
            }
        }

        // Insertar pago
        const result = await pool.query(
            `INSERT INTO Pago (id_cliente, id_membresia, id_inscripcion, monto, metodo_pago)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_pago`,
            [id_cliente, id_membresia || null, id_inscripcion || null, monto, metodo_pago]
        );

        res.json({
            mensaje: "Pago registrado exitosamente",
            id_pago: result.rows[0].id_pago,
            id_cliente,
            id_membresia,
            id_inscripcion
        });

    } catch (error) {
        console.error("Error al registrar pago:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// =====================================
//  GET /entrenadores  -> Lista de entrenadores
// =====================================
app.get("/entrenadores", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_entrenador, nombre, especialidad, horario, correo, telefono
             FROM Entrenador
             ORDER BY nombre ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error obteniendo entrenadores:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// =====================================
//  POST /entrenadores -> Crear entrenador
// =====================================
app.post("/entrenadores", async (req, res) => {
    try {
        const { nombre, especialidad, horario, correo, telefono } = req.body;

        if (!nombre || !correo) {
            return res.status(400).json({ error: "Nombre y correo son obligatorios" });
        }

        const result = await pool.query(
            `INSERT INTO Entrenador (nombre, especialidad, horario, correo, telefono)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, especialidad, horario, correo, telefono]
        );

        res.json({
            mensaje: "Entrenador registrado correctamente",
            entrenador: result.rows[0]
        });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        console.error("Error al crear entrenador:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// =====================================
//  PUT /entrenadores/:id -> Actualizar entrenador
// =====================================
// En server.js

// ... (El inicio del app.put es igual)
app.put("/entrenadores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let { nombre, especialidad, horario, correo, telefono } = req.body;

        // FUNCIÓN DE CONVERSIÓN: Si la cadena está vacía, la convertimos a NULL
        const toNullIfEmpty = (val) => (val === "" || val === undefined) ? null : val;

        // Aplicamos la conversión a los campos opcionales
        especialidad = toNullIfEmpty(especialidad);
        horario = toNullIfEmpty(horario);
        telefono = toNullIfEmpty(telefono);

        // Los campos 'nombre' y 'correo' deben estar validados en tu lógica si son obligatorios
        if (!nombre || !correo) {
             return res.status(400).json({ error: "Nombre y correo son obligatorios" });
        }


        // ... (El resto del código de verificación es igual)
        const check = await pool.query(
            "SELECT * FROM Entrenador WHERE id_entrenador = $1",
            [id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Entrenador no encontrado" });
        }

        const result = await pool.query(
            `UPDATE Entrenador
             SET nombre = $1,
                 especialidad = $2,
                 horario = $3,
                 correo = $4,
                 telefono = $5
             WHERE id_entrenador = $6
             RETURNING *`,
            [nombre, especialidad, horario, correo, telefono, id]
        );

        res.json({
            mensaje: "Entrenador actualizado correctamente",
            entrenador: result.rows[0]
        });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        console.error("❌ Error en PUT /entrenadores:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// =====================================
// DELETE /entrenadores/:id
// =====================================
app.delete("/entrenadores/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar existencia
        const check = await pool.query(
            "SELECT * FROM Entrenador WHERE id_entrenador = $1",
            [id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Entrenador no encontrado" });
        }

        // Eliminar
        await pool.query(
            "DELETE FROM Entrenador WHERE id_entrenador = $1",
            [id]
        );

        res.json({ mensaje: "Entrenador eliminado correctamente" });

    } catch (error) {
        console.error("❌ Error DELETE /entrenadores:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// =====================================
//  GET /clases -> Lista de clases con entrenador
// =====================================
app.get("/clases", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_clase,
                nombre AS clase,
                descripcion,
                intensidad,
                duracion,
                entrenador,
                capacidad AS cupo,
                horario,
                imagen_url
            FROM V_CURSOS_API
            ORDER BY nombre ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error obteniendo clases:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// =====================================
// GET /clases/:id -> Obtener una clase específica
// =====================================
app.get("/clases/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                id_clase,
                nombre AS clase,
                descripcion,
                intensidad,
                duracion,
                entrenador,
                capacidad AS cupo,
                horario,
                imagen_url
            FROM V_CURSOS_API
            WHERE id_clase = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Clase no encontrada" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("❌ Error GET /clases/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// backend-gym/server.js
app.get('/api/cursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM V_CURSOS_API');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cursos/:id -> Obtener un curso específico
app.get('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM V_CURSOS_API WHERE id_clase = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al obtener curso específico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// =====================================
//  POST /clases -> Crear clase
// =====================================
app.post("/clases", async (req, res) => {
    try {
        const { nombre, descripcion, intensidad, duracion, capacidad, horario, id_entrenador, imagen_url } = req.body;

        if (!nombre || !horario || capacidad == null) {
            return res.status(400).json({ error: "Nombre, horario y capacidad son obligatorios" });
        }

        // Verificar que el entrenador exista
        const entrenadorCheck = await pool.query(
            "SELECT id_entrenador FROM Entrenador WHERE id_entrenador = $1",
            [id_entrenador]
        );
        if (entrenadorCheck.rowCount === 0) {
            return res.status(404).json({ error: "Entrenador no encontrado" });
        }

        const result = await pool.query(`
            INSERT INTO Clase (nombre, descripcion, intensidad, duracion, capacidad, horario, id_entrenador, imagen_url)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `, [nombre, descripcion, intensidad, duracion, capacidad, horario, id_entrenador, imagen_url]);

        res.json({
            mensaje: "Clase creada correctamente",
            clase: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error al crear clase:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// =====================================
// DELETE /clases/:id
// =====================================
app.delete("/clases/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query("SELECT * FROM Clase WHERE id_clase = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Clase no encontrada" });
        }

        await pool.query("DELETE FROM Clase WHERE id_clase = $1", [id]);

        res.json({ mensaje: "Clase eliminada correctamente" });

    } catch (error) {
        console.error("❌ Error DELETE /clases/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// =====================================
// PUT /clases/:id
// =====================================
app.put("/clases/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, intensidad, duracion, capacidad, horario, id_entrenador, imagen_url } = req.body;

        const checkClase = await pool.query("SELECT * FROM Clase WHERE id_clase = $1", [id]);
        if (checkClase.rowCount === 0) {
            return res.status(404).json({ error: "Clase no encontrada" });
        }

        if (id_entrenador) {
            const checkEntrenador = await pool.query(
                "SELECT id_entrenador FROM Entrenador WHERE id_entrenador = $1",
                [id_entrenador]
            );
            if (checkEntrenador.rowCount === 0) {
                return res.status(404).json({ error: "Entrenador no encontrado" });
            }
        }

        const result = await pool.query(`
            UPDATE Clase
            SET nombre=$1, descripcion=$2, intensidad=$3, duracion=$4, capacidad=$5, horario=$6, id_entrenador=$7, imagen_url=$8
            WHERE id_clase=$9
            RETURNING *
        `, [nombre, descripcion, intensidad, duracion, capacidad, horario, id_entrenador, imagen_url, id]);

        res.json({
            mensaje: "Clase actualizada correctamente",
            clase: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error PUT /clases/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// =====================================
// GET /rutinas -> Todas las rutinas
// =====================================
app.get("/rutinas", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id_rutina, r.nombre, r.descripcion, r.nivel_dificultad,
                   c.nombre AS cliente,
                   e.nombre AS entrenador
            FROM Rutina r
            JOIN Cliente c ON r.id_cliente = c.id_cliente
            JOIN Entrenador e ON r.id_entrenador = e.id_entrenador
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("❌ Error GET /rutinas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


app.get("/rutinas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT r.*, 
                   c.nombre AS cliente,
                   e.nombre AS entrenador
            FROM Rutina r
            JOIN Cliente c ON r.id_cliente = c.id_cliente
            JOIN Entrenador e ON r.id_entrenador = e.id_entrenador
            WHERE r.id_rutina = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Rutina no encontrada" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("❌ Error GET /rutinas/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// =====================================
// POST /rutinas
// =====================================
app.post("/rutinas", async (req, res) => {
    try {
        const { nombre, descripcion, nivel_dificultad, id_cliente, id_entrenador } = req.body;

        // Validar cliente
        const checkCliente = await pool.query(
            "SELECT * FROM Cliente WHERE id_cliente = $1",
            [id_cliente]
        );
        if (checkCliente.rowCount === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        // Validar entrenador
        const checkEntr = await pool.query(
            "SELECT * FROM Entrenador WHERE id_entrenador = $1",
            [id_entrenador]
        );
        if (checkEntr.rowCount === 0) {
            return res.status(404).json({ error: "Entrenador no encontrado" });
        }

        const result = await pool.query(
            `INSERT INTO Rutina (nombre, descripcion, nivel_dificultad, id_cliente, id_entrenador)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, descripcion, nivel_dificultad, id_cliente, id_entrenador]
        );

        res.json({
            mensaje: "Rutina creada correctamente",
            rutina: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error POST /rutinas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.put("/rutinas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, nivel_dificultad, id_cliente, id_entrenador } = req.body;

        const check = await pool.query("SELECT * FROM Rutina WHERE id_rutina = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Rutina no encontrada" });
        }

        const result = await pool.query(
            `UPDATE Rutina
             SET nombre = $1,
                 descripcion = $2,
                 nivel_dificultad = $3,
                 id_cliente = $4,
                 id_entrenador = $5
             WHERE id_rutina = $6
             RETURNING *`,
            [nombre, descripcion, nivel_dificultad, id_cliente, id_entrenador, id]
        );

        res.json({
            mensaje: "Rutina actualizada correctamente",
            rutina: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error PUT /rutinas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


app.delete("/rutinas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query("SELECT * FROM Rutina WHERE id_rutina = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Rutina no encontrada" });
        }

        await pool.query("DELETE FROM Rutina WHERE id_rutina = $1", [id]);

        res.json({ mensaje: "Rutina eliminada correctamente" });

    } catch (error) {
        console.error("❌ Error DELETE /rutinas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ----------------------------------------------------
// GET /api/membresias - Obtener todas las membresías
// ----------------------------------------------------
app.get('/api/membresias', async (req, res) => {
  try {
    const query = `
      SELECT id_membresia, nombre, costo, estado, duracion_meses
      FROM membresia
      ORDER BY id_membresia;
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error al obtener membresías:", error);
    res.status(500).json({ error: "Error al obtener membresías." });
  }
});


// ----------------------------------------------------
// 3. Iniciar Servidor
// ----------------------------------------------------
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});