const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando correctamente' });
});

router.get('/datos', (req, res) => {
  res.json({
    proyecto: 'Proyecto Integrador Web',
    estado: 'activo',
    version: '1.0.0'
  });
});

module.exports = router;
