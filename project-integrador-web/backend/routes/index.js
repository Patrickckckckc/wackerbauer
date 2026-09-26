const express = require('express');
const router = express.Router();
const products = require('../products.json');

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

router.get('/products', (req, res) => {
  res.status(200).json(products);
});

module.exports = router;
