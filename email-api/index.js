const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes usar otro proveedor
  auth: {
    user: 'noreyumilde@gmail.com',
    pass: 'wkao arts jexu bfdw'
  }
});

// Ruta POST para recibir correo y enviar email
app.post('/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    await transporter.sendMail({
      from: '"Email prueba" <noreyumilde@gmail.com>',
      to,
      subject,
      text: message
    });

    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al enviar correo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
