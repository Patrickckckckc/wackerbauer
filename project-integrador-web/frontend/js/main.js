document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.querySelector('#year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const readStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let products = [];
  const cart = readStore('wackerbauer-cart');
  const wishlist = readStore('wackerbauer-wishlist');

  const updateCounts = () => {
    document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = cart.reduce((total, item) => total + item.quantity, 0); });
    document.querySelectorAll('[data-wishlist-count]').forEach((element) => { element.textContent = wishlist.length; });
  };

  const productData = (card) => ({ id: card.dataset.productId, name: card.dataset.productName, price: Number(card.dataset.productPrice), image: getComputedStyle(card.querySelector('.product-image')).backgroundImage });
  const refreshWishlistButtons = () => products.forEach((card) => { const button = card.querySelector('.wishlist-toggle'); if (button) { const saved = wishlist.some((item) => item.id === card.dataset.productId); button.classList.toggle('saved', saved); button.textContent = saved ? '♥' : '♡'; } });

  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.dataset.productName = product.name;
    card.dataset.productPrice = product.price;

    const image = document.createElement('div');
    image.className = 'product-image';
    image.style.backgroundImage = `url("${product.image}")`;
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'icon-button wishlist-toggle';
    favoriteButton.type = 'button';
    favoriteButton.setAttribute('aria-label', `Agregar ${product.name} a favoritos`);
    favoriteButton.textContent = '♡';
    image.append(favoriteButton);

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

  // This script runs on every page, so only fetch products where catalog grids exist.
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

  // Delegation keeps the controls working for cards added after the page loads.
  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-cart');
    const favoriteButton = event.target.closest('.wishlist-toggle');
    const card = event.target.closest('.product-card');
    if (!card) return;

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

  const renderSavedItems = (items, target, empty, isCart = false) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<article class="saved-item"><div class="saved-item-thumb" style="background-image:${item.image}"></div><div><h3>${item.name}</h3><p>${isCart ? `Cantidad: ${item.quantity}` : 'Guardado en favoritos'}</p></div><div><strong>${item.price * (isCart ? item.quantity : 1)} €</strong><br><button class="remove-button" data-remove-id="${item.id}">Eliminar</button></div></article>`).join('');
    target.querySelectorAll('[data-remove-id]').forEach((button) => button.addEventListener('click', () => { const index = items.findIndex((item) => item.id === button.dataset.removeId); items.splice(index, 1); writeStore(isCart ? 'wackerbauer-cart' : 'wackerbauer-wishlist', items); window.location.reload(); }));
    empty?.classList.toggle('visible', items.length === 0);
  };

  renderSavedItems(wishlist, document.querySelector('#wishlist-items'), document.querySelector('#wishlist-empty'));
  renderSavedItems(cart, document.querySelector('#cart-items'), document.querySelector('#cart-empty'), true);
  const total = document.querySelector('#cart-total'); if (total) total.textContent = `${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} €`;
  document.querySelector('#checkout-button')?.addEventListener('click', () => { alert('Gracias. La pasarela de pago estara disponible muy pronto.'); });
  refreshWishlistButtons(); updateCounts();
  loadProducts();

  document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active');
    document.querySelector('#login-form').classList.toggle('hidden', tab.dataset.authTab !== 'login'); document.querySelector('#register-form').classList.toggle('hidden', tab.dataset.authTab !== 'register');
  }));
  document.querySelectorAll('.auth-form').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#auth-message').textContent = 'Listo. Esta demo ya tiene tu formulario preparado.'; form.reset(); }));
});
