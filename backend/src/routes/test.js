const express = require('express');
const { config } = require('../config/config.js');
const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    const { sendReportEmail } = require('../utils/email.js');
    await sendReportEmail(to, subject || 'Prueba email Arcana Club', html || '<b>Esto es un email de prueba desde Arcana Club</b>');
    res.json({ success: true, message: 'Email enviado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error enviando email', error: err.message });
  }
});

module.exports = router;
