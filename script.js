// ═══════════════════════════════════════════════════════════════════════════
// NGH Foods — Frontend Logic
// All data now fetched from Supabase via /api/* Vercel serverless functions
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE = '/api';

// ── State ─────────────────────────────────────────────────────────────────
let foods              = [];
let restaurants        = [];
let category           = 'All';
let selectedRestaurant = 'All';
let cart               = [];

// ── Loader ────────────────────────────────────────────────────────────────
const loader = document.getElementById('loader');
setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 400); }, 1800);

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════
async function init() {
  // Build category filter buttons
  const cats = ['All', 'Fast Food', 'Meals', 'Biryani', 'Snacks', 'Drinks', 'Desserts'];
  document.getElementById('categories').innerHTML = cats.map(c =>
    `<button class="filter ${c === 'All' ? 'active' : ''}" onclick="choose('${c}')">${c}</button>`
  ).join('');

  // Show skeletons while loading
  showFoodSkeletons();
  showRestaurantSkeletons();

  try {
    const [foodsRes, restRes] = await Promise.all([
      fetch(`${API_BASE}/foods`),
      fetch(`${API_BASE}/restaurants`),
    ]);

    if (!foodsRes.ok) throw new Error('Menu failed to load');
    if (!restRes.ok)  throw new Error('Restaurants failed to load');

    const foodsData = await foodsRes.json();
    const restData  = await restRes.json();

    foods       = foodsData.foods       || [];
    restaurants = restData.restaurants  || [];

    renderRestaurants();
    renderFoods();
  } catch (err) {
    console.error('[init]', err);
    document.getElementById('foodGrid').innerHTML =
      `<p class="state-msg error-msg">⚠️ Could not load the menu. Please refresh the page.</p>`;
    document.querySelector('.restaurant-grid').innerHTML =
      `<p class="state-msg error-msg">⚠️ Could not load restaurants.</p>`;
  }
}

// ── Skeleton loaders ──────────────────────────────────────────────────────
function showFoodSkeletons() {
  document.getElementById('foodGrid').innerHTML =
    Array(8).fill('<div class="food-card skeleton"><div class="skel-img"></div><div class="skel-line w80"></div><div class="skel-line w60"></div><div class="skel-line w40"></div></div>').join('');
}
function showRestaurantSkeletons() {
  document.querySelector('.restaurant-grid').innerHTML =
    Array(6).fill('<div class="restaurant skeleton"><div class="skel-img tall"></div><div class="r-body"><div class="skel-line w40"></div><div class="skel-line w80"></div><div class="skel-line w60"></div></div></div>').join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// RESTAURANTS
// ═══════════════════════════════════════════════════════════════════════════
function renderRestaurants() {
  if (!restaurants.length) {
    document.querySelector('.restaurant-grid').innerHTML =
      '<p class="state-msg">No restaurants available.</p>';
    return;
  }
  document.querySelector('.restaurant-grid').innerHTML = restaurants.map(r => `
    <article class="restaurant" onclick="chooseRestaurant('${escHtml(r.name)}')">
      <img src="${escHtml(r.image || '')}" alt="${escHtml(r.name)}"
           onerror="this.style.display='none'">
      <div class="r-body">
        <span class="pill">${r.rating} ★</span>
        <h3>${escHtml(r.name)}</h3>
        <p>${escHtml(r.description || '')}</p>
        <small>${escHtml(r.delivery_time)} · ${escHtml(r.price_for_two)}</small>
        <button class="restaurant-menu">View Main Dishes →</button>
      </div>
    </article>`
  ).join('');
}

function chooseRestaurant(name) {
  selectedRestaurant = name;
  category           = 'All';
  document.getElementById('search').value = '';
  document.getElementById('sort').value   = '';
  document.querySelectorAll('.filter').forEach(x =>
    x.classList.toggle('active', x.textContent === 'All'));

  const r = restaurants.find(x => x.name === name);
  document.getElementById('restaurantNotice').innerHTML = `
    <div class="restaurant-selected">
      <div>
        <span class="tag">RESTAURANT MENU</span>
        <h3>${escHtml(r.name)}</h3>
        <p>Showing the main dishes available from this restaurant.</p>
      </div>
      <button onclick="clearRestaurant(event)">Show All Foods</button>
    </div>`;

  renderFoods();
  document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

function clearRestaurant(e) {
  e.stopPropagation();
  selectedRestaurant = 'All';
  document.getElementById('restaurantNotice').innerHTML = '';
  renderFoods();
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY FILTERS
// ═══════════════════════════════════════════════════════════════════════════
function choose(c) {
  selectedRestaurant = 'All';
  category           = c;
  document.getElementById('restaurantNotice').innerHTML = '';
  document.querySelectorAll('.filter').forEach(x =>
    x.classList.toggle('active', x.textContent === c));
  renderFoods();
  document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOD GRID
// ═══════════════════════════════════════════════════════════════════════════
function renderFoods() {
  const q    = document.getElementById('search').value.toLowerCase();
  const sort = document.getElementById('sort').value;

  let list = foods.filter(x =>
    (category           === 'All' || x.cat        === category) &&
    (selectedRestaurant === 'All' || x.restaurant === selectedRestaurant) &&
    x.name.toLowerCase().includes(q)
  );

  if (sort === 'priceLow')  list.sort((a, b) => a.price - b.price);
  if (sort === 'priceHigh') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating')    list.sort((a, b) => b.rating - a.rating);

  if (!list.length) {
    document.getElementById('foodGrid').innerHTML =
      '<p class="state-msg">No items match your search.</p>';
    return;
  }

  document.getElementById('foodGrid').innerHTML = list.map(x => {
    const outOfStock = x.stock === 0;
    return `
      <article class="food-card">
        <div class="food-img">
          <img src="${escHtml(x.img || '')}" alt="${escHtml(x.name)}"
               onerror="this.parentElement.classList.add('image-error');this.style.display='none'">
          <span class="image-fallback">🍽️</span>
          ${outOfStock ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
        </div>
        <div class="food-restaurant">${escHtml(x.restaurant)}</div>
        <h3>${escHtml(x.name)}</h3>
        <div class="rating">★ ${x.rating}</div>
        <div class="price">₹${x.price}</div>
        <button class="add" onclick="addCart(${x.id})" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </article>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════════════════
function addCart(id) {
  const f    = foods.find(x => x.id === id);
  const item = cart.find(x => x.id === id);

  if (item) {
    if (item.qty < f.stock) item.qty++;
    else { showToast('Stock limit reached for ' + f.name, 'error'); return; }
  } else {
    cart.push({ id, qty: 1 });
  }

  updateCart();

  // Flash cart button
  const btn = document.querySelector('.cart-btn');
  btn.style.background = '#d85b00';
  setTimeout(() => btn.style.background = '#202020', 300);

  showToast(`${f.name} added to cart 🛒`);
}

function updateCart() {
  document.getElementById('cartCount').textContent = cart.reduce((a, x) => a + x.qty, 0);
}

function openCart() {
  document.getElementById('cartModal').style.display = 'flex';
  renderCart();
}

function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
}

function renderCart() {
  let total = 0;
  const html = cart.map(x => {
    const f = foods.find(y => y.id === x.id);
    if (!f) return '';
    total += f.price * x.qty;
    return `
      <div class="cart-row">
        <div><b>${escHtml(f.name)}</b><br><span class="muted">₹${f.price} × ${x.qty}</span></div>
        <div class="qty">
          <button onclick="changeQty(${x.id}, -1)">−</button>
          <span>${x.qty}</span>
          <button onclick="changeQty(${x.id}, 1)">+</button>
        </div>
      </div>`;
  }).join('');

  document.getElementById('cartItems').innerHTML =
    html || '<p class="muted" style="text-align:center;padding:20px">Your cart is empty.</p>';
  document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function changeQty(id, n) {
  const item = cart.find(x => x.id === id);
  const f    = foods.find(x => x.id === id);
  if (!item) return;
  item.qty += n;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  else if (item.qty > f.stock) item.qty = f.stock;
  updateCart();
  renderCart();
}

function checkout() {
  if (!cart.length) { showToast('Your cart is empty.', 'error'); return; }
  closeCart();
  document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════════════
// PLACE ORDER (POST → /api/place-order)
// ═══════════════════════════════════════════════════════════════════════════
async function placeOrder(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled    = true;
  btn.textContent = 'Placing order…';

  const payload = {
    customer: {
      name:    document.getElementById('name').value.trim(),
      phone:   document.getElementById('phone').value.trim(),
      email:   document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
    },
    payment_method: document.getElementById('payment').value,
    items: cart.map(x => ({ id: x.id, qty: x.qty })),
  };

  try {
    const res  = await fetch(`${API_BASE}/place-order`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to place order.');

    // ── Success ──────────────────────────────────────────────────────────
    cart = [];
    updateCart();
    closeCheckout();
    e.target.reset();

    showToast(`✅ Order #${data.order_id} confirmed! Total: ₹${data.total.toFixed(2)}`);

    // Refresh menu stock from server
    refreshFoods();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Something went wrong.'), 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = originalText;
  }
}

async function refreshFoods() {
  try {
    const res  = await fetch(`${API_BASE}/foods`);
    const data = await res.json();
    if (data.foods) { foods = data.foods; renderFoods(); }
  } catch { /* silent */ }
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER TRACKING (GET /api/orders?phone=...)
// ═══════════════════════════════════════════════════════════════════════════
function initOrdersSection() {
  document.getElementById('ordersList').innerHTML = `
    <div class="order-lookup">
      <p>Enter your phone number to view your past orders.</p>
      <div class="lookup-row">
        <input id="lookupPhone" type="tel" placeholder="📞 Enter your phone number"
               onkeydown="if(event.key==='Enter') lookupOrders()">
        <button class="primary" onclick="lookupOrders()">Track Orders</button>
      </div>
    </div>
    <div id="ordersResult"></div>`;
}

async function lookupOrders() {
  const phone  = (document.getElementById('lookupPhone').value || '').trim();
  if (!phone) { showToast('Please enter your phone number.', 'error'); return; }

  const result = document.getElementById('ordersResult');
  result.innerHTML = '<p class="state-msg muted">Loading your orders…</p>';

  try {
    const res  = await fetch(`${API_BASE}/orders?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders.');

    const orders = data.orders || [];

    if (!orders.length) {
      result.innerHTML = '<p class="state-msg muted">No orders found for this number.</p>';
      return;
    }

    result.innerHTML = `
      <p class="orders-greeting">👋 Hello, <b>${escHtml(data.customer || '')}</b>! Here are your recent orders:</p>
      ${orders.map(o => {
        const items    = o.order_items || [];
        const dateStr  = new Date(o.created_at).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        const statusCls = o.status.toLowerCase().replace(/\s+/g, '-');
        return `
          <div class="order-card">
            <div class="order-header">
              <span class="order-id">Order #${o.id}</span>
              <span class="order-status status-${statusCls}">${o.status}</span>
            </div>
            <div class="order-meta">${dateStr} · ${escHtml(o.payment_method)}</div>
            <ul class="order-items-list">
              ${items.map(i =>
                `<li>${escHtml(i.food_items?.name || 'Item')} × ${i.quantity}
                 <span class="item-price">₹${(i.unit_price * i.quantity).toFixed(2)}</span></li>`
              ).join('')}
            </ul>
            <div class="order-total">Total: ₹${parseFloat(o.total_amount).toFixed(2)}</div>
          </div>`;
      }).join('')}`;
  } catch (err) {
    result.innerHTML = `<p class="state-msg error-msg">❌ ${escHtml(err.message)}</p>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY HELPER — escape HTML to prevent XSS from API data
// ═══════════════════════════════════════════════════════════════════════════
function escHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

// ═══════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════
init();
initOrdersSection();
