// ===== CART STATE =====
let cart = [];

function addToCart(name, desc) {
  const exists = cart.find(item => item.name === name);
  if (exists) {
    showToast(`${name} already in enquiry cart`);
    return;
  }
  cart.push({ name, desc, id: Date.now() });
  updateCartUI();
  updateCartTextarea();
  showToast(`${name} added to enquiry cart!`);

  // Mark button as added
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    if (btn.getAttribute('onclick').includes(name.replace(/'/g, "\\'"))) {
      btn.classList.add('added');
      btn.innerHTML = '<i class="fas fa-check"></i> Added';
    }
  });
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
  updateCartTextarea();
  if (item) {
    // Reset button
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(item.name.replace(/'/g, "\\'"))) {
        btn.classList.remove('added');
        btn.innerHTML = '<i class="fas fa-plus"></i> Add to Enquiry';
      }
    });
  }
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const summary = document.getElementById('cartSummary');

  badge.textContent = cart.length;

  if (cart.length === 0) {
    emptyMsg.style.display = 'block';
    footer.style.display = 'none';
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(emptyMsg);
  } else {
    emptyMsg.style.display = 'none';
    footer.style.display = 'block';
    summary.textContent = `${cart.length} vehicle(s) selected for enquiry`;

    const existing = document.getElementById('cartEmpty');
    itemsContainer.innerHTML = '';
    if (existing) itemsContainer.appendChild(existing);

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p>${item.desc}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      `;
      itemsContainer.appendChild(el);
    });
  }
}

function updateCartTextarea() {
  const textarea = document.getElementById('cartTextarea');
  if (!textarea) return;
  if (cart.length > 0) {
    textarea.value = cart.map(i => `• ${i.name} – ${i.desc}`).join('\n');
  } else {
    textarea.value = '';
  }
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ===== MOBILE MENU =====
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  links.classList.toggle('open');
  btn.classList.toggle('open');
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// ===== VEHICLE FILTER =====
function filterVehicles(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('#vehiclesGrid .vehicle-card').forEach(card => {
    if (category === 'all') {
      card.classList.remove('hidden');
    } else {
      const cats = card.getAttribute('data-category') || '';
      if (cats.includes(category)) card.classList.remove('hidden');
      else card.classList.add('hidden');
    }
  });
}

// ===== FUEL CALCULATOR =====
function calcSavings() {
  const fuel = parseFloat(document.getElementById('fuelInput').value) || 0;
  const electricRatio = 0.16;
  const electric = Math.round(fuel * electricRatio);
  const monthly = fuel - electric;
  const yearly = monthly * 12;

  document.getElementById('fuelCost').textContent = '₦' + fuel.toLocaleString();
  document.getElementById('electricCost').textContent = '₦' + electric.toLocaleString();
  document.getElementById('monthlySavings').textContent = '₦' + monthly.toLocaleString();
  document.getElementById('yearlySavings').textContent = '₦' + yearly.toLocaleString();

  document.getElementById('fuelSlider').value = fuel;
}

function syncSlider(val) {
  document.getElementById('fuelInput').value = val;
  calcSavings();
}

// Init calculator
calcSavings();

// ===== STATS COUNTER =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  // Apply reveal to sections
  document.querySelectorAll('.feature-card, .vehicle-card, .import-item, .contact-card, .process-step').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Stats counter
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);

  // Preorder form — inject cart
  const form = document.getElementById('preorderForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      updateCartTextarea();
    });
  }

  // Vehicle select — pre-fill from URL hash or cart
  const select = document.getElementById('vehicleSelect');
  if (select && cart.length > 0) {
    // auto-select first cart item
    const opts = Array.from(select.options);
    const match = opts.find(o => o.value.toLowerCase().includes(cart[0].name.toLowerCase().split(' ')[0]));
    if (match) select.value = match.value;
  }
});

// ===== TOAST =====
function showToast(msg) {
  let toast = document.getElementById('toastEl');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastEl';
    toast.style.cssText = `
      position: fixed; bottom: 6rem; left: 50%; transform: translateX(-50%);
      background: #111; color: #fff; padding: 0.75rem 1.5rem;
      border-radius: 100px; font-size: 0.85rem; z-index: 9999;
      border: 1px solid #E30613; font-family: 'Rajdhani', sans-serif;
      font-weight: 600; letter-spacing: 0.05em; white-space: nowrap;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
