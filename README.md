# WACKERBAUER

Título: Tienda virtual de ropa  
Curso: Programación Web  
Grupo: 4

WACKERBAUER es una tienda virtual de ropa enfocada en moda contemporánea, diseño funcional y una experiencia de compra simple y moderna. La aplicación combina un frontend dinámico con un backend en Node.js/Express para mostrar productos, gestionar favoritos, carrito de compras y autenticación de usuarios.

## Descripción del proyecto

La página simula un e-commerce de prendas para mujer y hombre, con:

- catálogo de productos con imágenes, nombre y precio
- sección de favoritos
- carrito de compras
- inicio de sesión y registro de usuarios
- sesiones de usuario persistentes en el navegador
- API REST para consultar y gestionar la información del proyecto

## Tutorial y guía

Este README ofrece una vista general del proyecto. El tutorial detallado, instrucciones paso a paso y la explicación del desarrollo se encuentran en el README interno de la aplicación:

- [project-integrador-web/README.md](./project-integrador-web/README.md)

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express

## Estructura del proyecto

```text
wackerbauer/
├── README.md
├── project-integrador-web/
│   ├── README.md
│   ├── frontend/
│   │   ├── index.html
│   │   ├── auth.html
│   │   ├── cart.html
│   │   ├── wishlist.html
│   │   ├── about.html
│   │   ├── css/
│   │   └── js/
│   └── backend/
│       ├── server.js
│       ├── routes/
│       ├── products.json
│       ├── users.json
│       └── package.json
└── informe-tecnico.pdf
```

## Páginas principales

- `frontend/index.html`: página principal con catálogo y hero section
- `frontend/auth.html`: registro e inicio de sesión
- `frontend/cart.html`: gestión del carrito
- `frontend/wishlist.html`: lista de favoritos
- `frontend/about.html`: historia y presentación de la marca

## Funcionalidades principales

### Catálogo de productos
La página principal consume la API `/api/products` y renderiza los productos según su categoría (`mujer` o `hombre`).

### Carrito y favoritos
El frontend guarda en `localStorage` la información del carrito y de los productos favoritos, permitiendo que el estado se mantenga al recargar la página.

### Autenticación
Los usuarios pueden registrarse e iniciar sesión mediante la API REST del backend. La sesión se valida con un token almacenado localmente y se mantiene activa durante la navegación.

## Inicio rápido

1. Abre una terminal.
2. Entra a la carpeta del proyecto:

```bash
cd project-integrador-web/backend
```

3. Instala las dependencias:

```bash
npm install
```

4. Inicia el servidor:

```bash
npm start
```

5. Abre la aplicación en el navegador:

```text
http://localhost:3000
```

## API REST

El backend expone estas rutas principales:

- `GET /api/health`: comprueba el estado del backend
- `GET /api/datos`: devuelve información básica del proyecto
- `GET /api/products`: devuelve la lista de productos
- `POST /api/auth/register`: registra un usuario
- `POST /api/auth/login`: inicia sesión
- `GET /api/auth/session`: obtiene la sesión activa
- `DELETE /api/auth/logout`: cierra sesión

## Ejemplo de uso

```bash
curl http://localhost:3000/api/health
```

## Nota final

Este proyecto representa una aplicación web completa de e-commerce con frontend estático y backend funcional. La guía de tutorial y la documentación extendida están en el README interno de [project-integrador-web/README.md](./project-integrador-web/README.md).
