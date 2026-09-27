# Proyecto Integrador Web

Aplicación web con una interfaz estática y una API REST servidas por un backend de Express.

## Requisitos

- Node.js y npm

## Estructura

- `frontend/`: páginas, estilos y scripts del cliente.
- `backend/`: servidor Express, rutas de la API y datos de productos.

## Inicio rápido

Desde la raíz del proyecto, instala las dependencias e inicia el servidor:

```bash
cd backend
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Express sirve la interfaz desde `frontend/` y la API bajo `/api`. El puerto predeterminado es `3000`; se puede cambiar con la variable de entorno `PORT`.

## API

- `GET /api/health`: comprueba el estado del backend.
- `GET /api/datos`: devuelve información básica del proyecto.
- `GET /api/products`: devuelve la lista de productos.
- `POST /api/auth/register`: crea una cuenta con `username`, `email` y `password`.
- `POST /api/auth/login`: inicia sesion con `email` y `password`.
- `GET /api/auth/session`: devuelve el usuario de la sesion autenticada.
- `DELETE /api/auth/logout`: cierra la sesion autenticada.

Las rutas de sesion usan el encabezado `Authorization: Bearer <token>`. Las cuentas se guardan en `backend/users.json` con contrasenas cifradas mediante hash con sal. Las sesiones activas se mantienen en memoria y se cierran al reiniciar el servidor.

## Tecnologías

- HTML, CSS y JavaScript
- Node.js y Express
