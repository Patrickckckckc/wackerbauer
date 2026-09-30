document.addEventListener('DOMContentLoaded', () => {
  // Configuración compartida de la página y estado persistente
  const yearElement = document.querySelector('#year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Lee los datos persistidos del navegador para restaurar el estado de la sesión actual.
  const readStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  // Guarda la información local para que el carrito, favoritos y usuario sigan disponibles al recargar.
  const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let products = [];
  const cart = readStore('wackerbauer-cart');
  const wishlist = readStore('wackerbauer-wishlist');
  const authTokenKey = 'wackerbauer-token';
  let authToken = localStorage.getItem(authTokenKey);
  let currentUser = null;
  let sessionPromise = Promise.resolve();

  // Estado de autenticación y acciones protegidas
  const updateAuthUI = () => {
    const loginLink = document.querySelector('.nav-login');
    if (loginLink) {
      loginLink.textContent = currentUser ? 'Cerrar sesion' : 'Entrar';
      loginLink.href = currentUser ? '#' : 'auth.html';
      loginLink.dataset.logout = currentUser ? 'true' : 'false';
    }
    const welcomeMessage = document.querySelector('#welcome-message');
    if (welcomeMessage) {
      welcomeMessage.textContent = currentUser ? `Hola, ${currentUser.username}` : '';
      welcomeMessage.classList.toggle('hidden', !currentUser);
    }
  };

  if (authToken) {
    sessionPromise = fetch('/api/auth/session', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Sesion no valida');
        const data = await response.json();
        currentUser = data.user;
      })
      .catch(() => {
        localStorage.removeItem(authTokenKey);
        authToken = null;
      })
      .then(updateAuthUI);
  } else {
    updateAuthUI();
  }

  // Redirige al usuario a la pantalla de autenticación con la URL de la página original como retorno.
  const openAuthForCurrentPage = () => {
    const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    sessionStorage.setItem('wackerbauer-auth-message', 'Inicia sesion o crea una cuenta para continuar.');
    window.location.href = `auth.html?next=${encodeURIComponent(next)}`;
  };

  // Verifica si existe un usuario activo antes de permitir acciones privadas como comprar o guardar favoritos.
  const requireUser = async () => {
    await sessionPromise;
    if (currentUser) return true;
    openAuthForCurrentPage();
    return false;
  };

  // Actualiza los contadores visibles del carrito y favoritos en cada vista de la aplicación.
  const updateCounts = () => {
    document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = cart.reduce((total, item) => total + item.quantity, 0); });
    document.querySelectorAll('[data-wishlist-count]').forEach((element) => { element.textContent = wishlist.length; });
  };

  // Creación de tarjetas de productos y carga del catálogo
  const productData = (card) => {
    const image = card.querySelector('.product-photo');
    return { id: card.dataset.productId, name: card.dataset.productName, price: Number(card.dataset.productPrice), image: `url("${image.src}")`, alt: image.alt };
  };
  const refreshWishlistButtons = () => products.forEach((card) => { const button = card.querySelector('.wishlist-toggle'); if (button) { const saved = wishlist.some((item) => item.id === card.dataset.productId); button.classList.toggle('saved', saved); button.textContent = saved ? '♥' : '♡'; } });

  // Construye cada tarjeta del catálogo con imagen, nombre, precio y botones de acción.
  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.dataset.productName = product.name;
    card.dataset.productPrice = product.price;

    const image = document.createElement('div');
    image.className = 'product-image';
    const photo = document.createElement('img');
    photo.className = 'product-photo';
    photo.src = product.image;
    photo.alt = product.alt;
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'icon-button wishlist-toggle';
    favoriteButton.type = 'button';
    favoriteButton.setAttribute('aria-label', `Agregar ${product.name} a favoritos`);
    favoriteButton.textContent = '♡';
    image.append(photo, favoriteButton);

    const info = document.createElement('div');
    info.className = 'product-info';
    const description = document.createElement('div');
    const name = document.createElement('h4');
    name.textContent = product.name;
    const details = document.createElement('p');
    const type = product.category.includes('calzado') ? 'Calzado' : 'Prendas';
    details.textContent = `${type} · ${product.color}`;
    description.append(name, details);
    const price = document.createElement('strong');
    price.textContent = `${product.price} €`;
    info.append(description, price);

    const addButton = document.createElement('button');
    addButton.className = 'text-button add-cart';
    addButton.type = 'button';
    addButton.textContent = 'Agregar al carrito';
    card.append(image, info, addButton);
    return card;
  };

  // Este script se ejecuta en todas las páginas, así que solo se obtienen productos donde existen cuadrículas de catálogo.
  const loadProducts = async () => {
    const categories = {
      mujer: document.querySelector('#mujer-prendas'),
      hombre: document.querySelector('#hombre-prendas')
    };
    if (!categories.mujer || !categories.hombre) return;

    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error(`No se pudieron cargar los productos (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('La respuesta de productos no es valida');

      Object.values(categories).forEach((container) => container.replaceChildren());
      products = [];
      data.forEach((product) => {
        const audience = product.category.split('-')[0];
        const container = categories[audience];
        if (!container) return;
        const card = createProductCard(product);
        container.append(card);
        products.push(card);
      });

      if (products.length === 0) {
        categories.mujer.textContent = 'No hay productos disponibles.';
      }
      Object.values(categories).forEach((container) => container.setAttribute('aria-busy', 'false'));
      refreshWishlistButtons();
    } catch (error) {
      Object.values(categories).forEach((container) => {
        container.replaceChildren();
        const message = document.createElement('p');
        message.setAttribute('role', 'status');
        message.textContent = 'No se pudieron cargar los productos. Comprueba que el servidor este activo.';
        container.append(message);
        container.setAttribute('aria-busy', 'false');
      });
      console.error(error);
    }
  };

  // Acciones del carrito y lista de deseos
  // La delegación mantiene funcionando los controles para las tarjetas añadidas después de cargar la página.
  document.addEventListener('click', async (event) => {
    const loginLink = event.target.closest('.nav-login');
    if (loginLink?.dataset.logout === 'true') {
      event.preventDefault();
      await sessionPromise;
      if (authToken) {
        try {
          await fetch('/api/auth/logout', { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
        } catch (error) {
          console.error(error);
        }
      }
      localStorage.removeItem(authTokenKey);
      authToken = null;
      currentUser = null;
      updateAuthUI();
      return;
    }

    const addButton = event.target.closest('.add-cart');
    const favoriteButton = event.target.closest('.wishlist-toggle');
    const card = event.target.closest('.product-card');
    if (!card || (!addButton && !favoriteButton) || !(await requireUser())) return;

    if (addButton) {
      const product = productData(card); const existing = cart.find((item) => item.id === product.id);
      if (existing) existing.quantity += 1; else cart.push({ ...product, quantity: 1 });
      writeStore('wackerbauer-cart', cart); updateCounts();
      addButton.textContent = 'Agregado ✓';
      window.setTimeout(() => { if (addButton.isConnected) addButton.textContent = 'Agregar al carrito'; }, 1400);
    }

    if (favoriteButton) {
      const index = wishlist.findIndex((item) => item.id === card.dataset.productId);
      if (index >= 0) wishlist.splice(index, 1); else wishlist.push(productData(card));
      writeStore('wackerbauer-wishlist', wishlist); updateCounts(); refreshWishlistButtons();
    }
  });

  // Páginas de elementos guardados y total del carrito
  // Renderiza la lista de productos guardados en la página de favoritos o del carrito con su acción de eliminar.
  const renderSavedItems = (items, target, empty, isCart = false) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<article class="saved-item"><div class="saved-item-thumb" style="background-image:${item.image}"></div><div><h3>${item.name}</h3><p>${isCart ? `Cantidad: ${item.quantity}` : 'Guardado en favoritos'}</p></div><div><strong>${item.price * (isCart ? item.quantity : 1)} €</strong><br><button class="remove-button" data-remove-id="${item.id}">Eliminar</button></div></article>`).join('');
    target.querySelectorAll('.saved-item-thumb').forEach((image, index) => {
      image.setAttribute('role', 'img');
      image.setAttribute('aria-label', items[index].alt || items[index].name);
    });
    target.querySelectorAll('[data-remove-id]').forEach((button) => button.addEventListener('click', () => { const index = items.findIndex((item) => item.id === button.dataset.removeId); items.splice(index, 1); writeStore(isCart ? 'wackerbauer-cart' : 'wackerbauer-wishlist', items); window.location.reload(); }));
    empty?.classList.toggle('visible', items.length === 0);
  };

  renderSavedItems(wishlist, document.querySelector('#wishlist-items'), document.querySelector('#wishlist-empty'));
  renderSavedItems(cart, document.querySelector('#cart-items'), document.querySelector('#cart-empty'), true);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = document.querySelector('#cart-total'); if (total) total.textContent = `${cartTotal} €`;
  const checkoutButton = document.querySelector('#checkout-button');
  const checkoutSection = document.querySelector('#checkout-section');
  const paymentForm = document.querySelector('#payment-form');
  const cardNumber = document.querySelector('#card-number');
  const paymentAmount = document.querySelector('#payment-amount');
  const checkoutDialog = document.querySelector('#checkout-success-dialog');

  // Validación del pago y compra
  if (paymentAmount) paymentAmount.value = cartTotal.toFixed(2);
  if (checkoutButton) {
    checkoutButton.disabled = cartTotal <= 0;
    checkoutButton.addEventListener('click', () => {
      if (cartTotal <= 0) return;
      checkoutSection.classList.remove('hidden');
      checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Comprueba si el número de tarjeta cumple el algoritmo de Luhn antes de aceptar el pago.
  const isValidCardNumber = (value) => {
    const digits = value.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0;
    let doubleDigit = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  };

  cardNumber?.addEventListener('input', () => cardNumber.setCustomValidity(''));
  paymentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    cardNumber.setCustomValidity(isValidCardNumber(cardNumber.value) ? '' : 'Introduce un numero de tarjeta valido.');
    if (Number(paymentAmount.value) !== cartTotal || cartTotal <= 0) {
      paymentAmount.setCustomValidity('El importe debe coincidir con el total del carrito.');
    } else {
      paymentAmount.setCustomValidity('');
    }
    if (!paymentForm.reportValidity()) return;

    paymentForm.reset();
    cart.length = 0;
    writeStore('wackerbauer-cart', cart);
    updateCounts();
    checkoutDialog?.showModal();
  });
  checkoutDialog?.addEventListener('cancel', (event) => event.preventDefault());
  document.querySelector('#close-checkout-dialog')?.addEventListener('click', () => {
    checkoutDialog.close();
    window.location.href = 'index.html';
  });

  // Inicialización del catálogo y de la página compartida
  refreshWishlistButtons(); updateCounts();
  loadProducts();

  // Formularios de inicio de sesión y registro
  // Cambia entre la pestaña de inicio de sesión y registro sin recargar la página.
  document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active');
    document.querySelector('#login-form').classList.toggle('hidden', tab.dataset.authTab !== 'login'); document.querySelector('#register-form').classList.toggle('hidden', tab.dataset.authTab !== 'register');
  }));

  const authMessage = document.querySelector('#auth-message');
  if (authMessage) {
    authMessage.textContent = sessionStorage.getItem('wackerbauer-auth-message') || '';
    sessionStorage.removeItem('wackerbauer-auth-message');
    if (new URLSearchParams(window.location.search).get('tab') === 'register') {
      document.querySelector('[data-auth-tab="register"]')?.click();
    }
  }

  document.querySelectorAll('.auth-form').forEach((form) => form.addEventListener('submit', async (event) => {
    event.preventDefault();
    authMessage.textContent = '';
    const isRegistration = form.id === 'register-form';
    const payload = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(`/api/auth/${isRegistration ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem(authTokenKey, authToken);
      sessionPromise = Promise.resolve();
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : 'index.html';
      window.location.href = safeNext;
    } catch (error) {
      authMessage.textContent = error.message || 'No se pudo conectar con el servidor.';
    }
  }));
});
