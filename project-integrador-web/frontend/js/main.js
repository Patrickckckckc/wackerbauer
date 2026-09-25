document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.querySelector('#year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const readStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const products = [...document.querySelectorAll('.product-card')];
  const cart = readStore('wackerbauer-cart');
  const wishlist = readStore('wackerbauer-wishlist');

  const updateCounts = () => {
    document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = cart.reduce((total, item) => total + item.quantity, 0); });
    document.querySelectorAll('[data-wishlist-count]').forEach((element) => { element.textContent = wishlist.length; });
  };

  const productData = (card) => ({ id: card.dataset.productId, name: card.dataset.productName, price: Number(card.dataset.productPrice), image: getComputedStyle(card.querySelector('.product-image')).backgroundImage });
  const refreshWishlistButtons = () => products.forEach((card) => { const button = card.querySelector('.wishlist-toggle'); if (button) { const saved = wishlist.some((item) => item.id === card.dataset.productId); button.classList.toggle('saved', saved); button.textContent = saved ? '♥' : '♡'; } });

  products.forEach((card) => {
    card.querySelector('.add-cart')?.addEventListener('click', () => {
      const product = productData(card); const existing = cart.find((item) => item.id === product.id);
      if (existing) existing.quantity += 1; else cart.push({ ...product, quantity: 1 });
      writeStore('wackerbauer-cart', cart); updateCounts();
      card.querySelector('.add-cart').textContent = 'Agregado ✓';
      window.setTimeout(() => { card.querySelector('.add-cart').textContent = 'Agregar al carrito'; }, 1400);
    });
    card.querySelector('.wishlist-toggle')?.addEventListener('click', () => {
      const index = wishlist.findIndex((item) => item.id === card.dataset.productId);
      if (index >= 0) wishlist.splice(index, 1); else wishlist.push(productData(card));
      writeStore('wackerbauer-wishlist', wishlist); updateCounts(); refreshWishlistButtons();
    });
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

  document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active');
    document.querySelector('#login-form').classList.toggle('hidden', tab.dataset.authTab !== 'login'); document.querySelector('#register-form').classList.toggle('hidden', tab.dataset.authTab !== 'register');
  }));
  document.querySelectorAll('.auth-form').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#auth-message').textContent = 'Listo. Esta demo ya tiene tu formulario preparado.'; form.reset(); }));
});
