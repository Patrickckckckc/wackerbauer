const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const products = require('../products.json');
const usersPath = path.join(__dirname, '../users.json');

// Almacena sesiones activas por token para validar usuarios autenticados en peticiones posteriores.
const sessions = new Map();

// Carga y guarda los usuarios desde el archivo JSON local del proyecto.
const readUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const writeUsers = (users) => fs.writeFileSync(usersPath, `${JSON.stringify(users, null, 2)}\n`);

// Devuelve solo la información pública del usuario para no exponer la contraseña ni datos sensibles.
const publicUser = (user) => ({ username: user.username, email: user.email });

// Crea un token de sesión y lo devuelve junto con los datos del usuario autenticado.
const issueSession = (res, user, status = 200) => {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, user.email);
  res.status(status).json({ token, user: publicUser(user) });
};

// Middleware que valida el token Bearer enviado por el cliente y protege rutas privadas.
const requireAuth = (req, res, next) => {
  const token = req.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  const email = token && sessions.get(token);
  if (!email) return res.status(401).json({ error: 'Inicia sesion para continuar.' });
  req.authenticatedEmail = email;
  next();
};

// Verifica que el backend esté activo y listo para recibir peticiones.
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando correctamente' });
});

// Endpoint de diagnóstico para confirmar información básica del proyecto en ejecución.
router.get('/datos', (req, res) => {
  res.json({
    proyecto: 'Proyecto Integrador Web',
    estado: 'activo',
    version: '1.0.0'
  });
});

// Devuelve el catálogo de productos disponible para el frontend.
router.get('/products', (req, res) => {
  res.status(200).json(products);
});

// Registra un nuevo usuario y crea una sesión automática tras guardar sus datos.
router.post('/auth/register', (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (username.length < 2 || username.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Introduce un nombre, un email valido y una contrasena de al menos 8 caracteres.' });
  }

  const users = readUsers();
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
  }

  const passwordSalt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, passwordSalt, 64).toString('hex');
  const user = { username, email, passwordSalt, passwordHash };
  users.push(user);
  writeUsers(users);
  issueSession(res, user, 201);
});

// Inicia sesión validando la contraseña con el hash almacenado para ese usuario.
router.post('/auth/login', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = readUsers().find((candidate) => candidate.email === email);
  if (!user || !password) return res.status(401).json({ error: 'Email o contrasena incorrectos.' });

  const passwordHash = crypto.scryptSync(password, user.passwordSalt, 64);
  const storedHash = Buffer.from(user.passwordHash, 'hex');
  if (passwordHash.length !== storedHash.length || !crypto.timingSafeEqual(passwordHash, storedHash)) {
    return res.status(401).json({ error: 'Email o contrasena incorrectos.' });
  }

  issueSession(res, user);
});

// Devuelve la sesión activa del usuario si el token recibido es válido.
router.get('/auth/session', requireAuth, (req, res) => {
  const user = readUsers().find((candidate) => candidate.email === req.authenticatedEmail);
  if (!user) return res.status(401).json({ error: 'La sesion ya no es valida.' });
  res.json({ user: publicUser(user) });
});

// Elimina la sesión del cliente para cerrar la cuenta en el navegador.
router.delete('/auth/logout', (req, res) => {
  const token = req.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (token) sessions.delete(token);
  res.status(204).end();
});

module.exports = router;
