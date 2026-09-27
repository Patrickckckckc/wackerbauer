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

## Tecnologías

- HTML, CSS y JavaScript
- Node.js y Express
