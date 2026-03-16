/* ============================================================
   LOWOODLA — script.js
   Funcionalidades globales del sitio
   ============================================================ */

// ── Estado global del carrito
const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('lw-cart') || '[]');

  function save() {
    localStorage.setItem('lw-cart', JSON.stringify(items));
    renderCartUI();
    updateCartBadge();
  }

  function add(product) {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    save();
    showToast(`${product.name} agregado al carrito`, 'success');
    openCart();
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
  }

  function setQty(id, qty) {
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      save();
    }
  }

  function getItems() { return items; }

  function getTotal() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  function clear() { items = []; save(); }

  return { add, remove, setQty, getItems, getTotal, getCount, clear };
})();

// ── Actualizar badge del carrito en el header
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = Cart.getCount();
  badges.forEach(b => {
    b.textContent = count;
    b.classList.toggle('visible', count > 0);
  });
}

// ── Renderizar items del carrito en el panel
function renderCartUI() {
  const body = document.querySelector('.cart-panel__body');
  const totalEl = document.querySelector('.cart-total__val');
  if (!body) return;

  const items = Cart.getItems();
  body.innerHTML = '';

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <div class="cart-empty__msg">Tu carrito está vacío</div>
      </div>`;
  } else {
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item__img">${item.emoji || '📦'}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">Q${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item__qty">
            <button class="qty-btn" onclick="Cart.setQty('${item.id}', ${item.qty - 1})">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.setQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="Cart.remove('${item.id}')" title="Eliminar">✕</button>
      `;
      body.appendChild(el);
    });
  }

  if (totalEl) {
    totalEl.textContent = `Q${Cart.getTotal().toFixed(2)}`;
  }
}

// ── Abrir / cerrar carrito
function openCart() {
  document.querySelector('.cart-panel')?.classList.add('open');
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.querySelector('.cart-panel')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Menú hamburguesa
function initHamburger() {
  const btn = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!btn || !mobileNav) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Cerrar al hacer click en un link
  mobileNav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !mobileNav.contains(e.target)) {
      btn.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

// ── Toast notifications
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', info: 'ℹ️', error: '❌' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span class="toast__msg">${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ── Intersection Observer para animaciones fade-up
function initFadeUp() {
  const targets = document.querySelectorAll('.fade-up');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

// ── Botón back to top
function initBackToTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Galería de imágenes (página producto-detalle)
function initGallery() {
  const mainImg = document.querySelector('.gallery__main-img');
  const thumbs  = document.querySelectorAll('.gallery__thumb');
  const prev    = document.querySelector('.gallery__nav--prev');
  const next    = document.querySelector('.gallery__nav--next');
  if (!mainImg || !thumbs.length) return;

  let current = 0;

  function setActive(idx) {
    current = (idx + thumbs.length) % thumbs.length;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    const src = thumbs[current].querySelector('img')?.src;
    if (src) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
      }, 150);
    }
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => setActive(i)));
  prev?.addEventListener('click', () => setActive(current - 1));
  next?.addEventListener('click', () => setActive(current + 1));

  // Swipe en móvil
  let touchStart = 0;
  mainImg.parentElement.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
  }, { passive: true });
  mainImg.parentElement.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setActive(current + (diff > 0 ? 1 : -1));
  });
}

// ── Filtros de categoría
function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      // Aquí se puede conectar lógica de filtrado real
    });
  });
}

// ── Marca de página activa en nav
function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .mobile-nav .nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

// ── Botón agregar al carrito (en páginas de producto)
function initAddToCart() {
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.id    || 'prod-' + Math.random().toString(36).slice(2);
      const name  = btn.dataset.name  || 'Producto';
      const price = parseFloat(btn.dataset.price) || 0;
      const emoji = btn.dataset.emoji || '📦';
      Cart.add({ id, name, price, emoji });
    });
  });
}

// ── Botón favoritos
function initFavorites() {
  document.querySelectorAll('[data-favorite]').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('glow-border');
      showToast(active ? 'Agregado a favoritos ❤️' : 'Eliminado de favoritos', 'info');
    });
  });
}

// ── DOMContentLoaded — inicializar todo
document.addEventListener('DOMContentLoaded', () => {
  // Carrito
  const cartTriggers = document.querySelectorAll('[data-open-cart]');
  cartTriggers.forEach(t => t.addEventListener('click', openCart));

  const cartCloseBtn = document.querySelector('.cart-close');
  cartCloseBtn?.addEventListener('click', closeCart);

  const overlay = document.querySelector('.cart-overlay');
  overlay?.addEventListener('click', closeCart);

  renderCartUI();
  updateCartBadge();

  // Global
  initHamburger();
  initFadeUp();
  initBackToTop();
  initGallery();
  initFilters();
  markActiveNav();
  initAddToCart();
  initFavorites();
});

// ── Generador de Factura PDF ──────────────────────────────────
// Usa jsPDF (cargado desde CDN en cada página)
// Se llama desde el botón "Proceder al pago" del panel del carrito

function generateInvoicePDF() {
  const items = Cart.getItems();

  if (items.length === 0) {
    showToast('El carrito está vacío 🛒', 'info');
    return;
  }

  // Verificar que jsPDF esté disponible
  if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
    showToast('Cargando generador de PDF...', 'info');
    // Cargar jsPDF dinámicamente si no está disponible
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => buildPDF(items);
    script.onerror = () => showToast('Error al cargar jsPDF', 'error');
    document.head.appendChild(script);
    return;
  }

  buildPDF(items);
}

function buildPDF(items) {
  const { jsPDF } = window.jspdf || window;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;

  // ── Paleta de colores ──
  const navy   = [13, 22, 40];      // --bg-secondary
  const blue   = [37, 99, 235];     // --blue-mid
  const blueL  = [59, 130, 246];    // --blue-light
  const white  = [232, 240, 254];   // --text-primary
  const gray   = [148, 163, 184];   // --text-secondary
  const dark   = [8, 13, 26];       // --bg-primary
  const green  = [74, 222, 128];    // stock green

  // ── Fondo header ──
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageW, 52, 'F');

  // ── Línea azul superior ──
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageW, 3, 'F');

  // ── Logo ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...white);
  doc.text('LOW', margin, 22);

  const lowW = doc.getTextWidth('LOW');
  doc.setTextColor(...blueL);
  doc.text('OOD', margin + lowW, 22);
  const oodW = doc.getTextWidth('OOD');
  doc.setTextColor(...white);
  doc.text('LA', margin + lowW + oodW, 22);

  // ── Subtítulo logo ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('Tu tienda en Guatemala', margin, 29);

  // ── Título FACTURA (derecha) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...blueL);
  const facTitle = 'ORDEN DE COMPRA';
  doc.text(facTitle, pageW - margin, 20, { align: 'right' });

  // ── Número y fecha ──
  const orderNum = 'LW-' + Date.now().toString().slice(-6);
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr  = now.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`N° ${orderNum}`, pageW - margin, 28, { align: 'right' });
  doc.text(`Fecha: ${dateStr}`, pageW - margin, 34, { align: 'right' });
  doc.text(`Hora: ${timeStr}`, pageW - margin, 40, { align: 'right' });

  // ── Línea divisoria ──
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.4);
  doc.line(margin, 54, pageW - margin, 54);

  // ── Sección "Datos del pedido" ──
  let y = 64;

  doc.setFillColor(...dark);
  doc.roundedRect(margin, y - 6, contentW, 30, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...blueL);
  doc.text('INFORMACIÓN DEL PEDIDO', margin + 8, y + 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...white);
  doc.text('Tienda:', margin + 8, y + 9);
  doc.setFont('helvetica', 'bold');
  doc.text('LOWOODLA Guatemala', margin + 28, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.text('Estado:', margin + 8, y + 16);
  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.text('● Pedido recibido — pendiente de confirmación', margin + 28, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.setFontSize(7.5);
  doc.text('Te contactaremos por WhatsApp o redes sociales para coordinar el pago y envío.', margin + 8, y + 22);

  y += 40;

  // ── Tabla de productos — encabezado ──
  doc.setFillColor(...blue);
  doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...white);

  const colDesc  = margin + 4;
  const colQty   = margin + contentW * 0.62;
  const colUnit  = margin + contentW * 0.75;
  const colTotal = margin + contentW * 0.90;

  doc.text('Producto', colDesc, y + 6);
  doc.text('Cant.', colQty,  y + 6, { align: 'center' });
  doc.text('Precio', colUnit, y + 6, { align: 'center' });
  doc.text('Total', colTotal + 4, y + 6, { align: 'right' });

  y += 12;

  // ── Filas de productos ──
  let subtotal = 0;

  items.forEach((item, idx) => {
    const rowH   = 11;
    const isEven = idx % 2 === 0;

    // Fondo alternado
    doc.setFillColor(...(isEven ? [11, 17, 31] : [13, 22, 40]));
    doc.rect(margin, y - 3, contentW, rowH, 'F');

    // Borde izquierdo azul en fila impar
    if (!isEven) {
      doc.setFillColor(...blueL);
      doc.rect(margin, y - 3, 2, rowH, 'F');
    }

    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    // Emoji + nombre
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);

    const name = item.name.length > 46 ? item.name.slice(0, 43) + '...' : item.name;
    doc.text(`${item.emoji || '•'}  ${name}`, colDesc, y + 4);

    // Cantidad
    doc.setTextColor(...gray);
    doc.text(String(item.qty), colQty, y + 4, { align: 'center' });

    // Precio unitario
    doc.text(`Q${item.price.toFixed(2)}`, colUnit, y + 4, { align: 'center' });

    // Total
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${lineTotal.toFixed(2)}`, colTotal + 4, y + 4, { align: 'right' });

    y += rowH;
  });

  // ── Línea cierre tabla ──
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  y += 8;

  // ── Totales ──
  const boxX = margin + contentW * 0.55;
  const boxW = contentW * 0.45;

  doc.setFillColor(...dark);
  doc.roundedRect(boxX, y - 4, boxW, 34, 3, 3, 'F');

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...gray);
  doc.text('Subtotal:', boxX + 6, y + 4);
  doc.setTextColor(...white);
  doc.text(`Q${subtotal.toFixed(2)}`, boxX + boxW - 6, y + 4, { align: 'right' });

  // Envío
  y += 8;
  doc.setTextColor(...gray);
  doc.text('Envío:', boxX + 6, y + 4);
  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'italic');
  doc.text('A coordinar', boxX + boxW - 6, y + 4, { align: 'right' });

  // Línea
  y += 6;
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.3);
  doc.line(boxX + 4, y, boxX + boxW - 4, y);

  // Total
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...blueL);
  doc.text('TOTAL:', boxX + 6, y + 2);
  doc.setFontSize(12);
  doc.text(`Q${subtotal.toFixed(2)}`, boxX + boxW - 6, y + 2, { align: 'right' });

  // ── Cantidad de artículos ──
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`${totalItems} artículo${totalItems !== 1 ? 's' : ''}`, margin, y + 2);

  y += 24;

  // ── Sección instrucciones ──
  doc.setFillColor(...[17, 30, 53]);
  doc.roundedRect(margin, y, contentW, 36, 3, 3, 'F');

  doc.setFillColor(...blueL);
  doc.roundedRect(margin, y, 3, 36, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...blueL);
  doc.text('PRÓXIMOS PASOS', margin + 8, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text('1. Guardá o imprimí esta orden de compra.', margin + 8, y + 16);
  doc.text('2. Envianos esta factura por WhatsApp o Instagram.', margin + 8, y + 22);
  doc.text('3. Te confirmamos disponibilidad y coordinamos el pago y envío.', margin + 8, y + 28);

  y += 44;

  // ── Contacto ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...blueL);
  doc.text('CONTACTO:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text('📱 WhatsApp: +502 0000-0000', margin, y + 6);
  doc.text('📸 Instagram: @lowoodla', margin + 64, y + 6);
  doc.text('🎵 TikTok: @lowoodla', margin + 128, y + 6);

  // ── Footer ──
  doc.setFillColor(...navy);
  doc.rect(0, pageH - 16, pageW, 16, 'F');

  doc.setFillColor(...blue);
  doc.rect(0, pageH - 16, pageW, 1.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text('© 2025 LOWOODLA — Hecho con ❤ en Guatemala', pageW / 2, pageH - 7, { align: 'center' });
  doc.text(`Orden N° ${orderNum}`, pageW - margin, pageH - 7, { align: 'right' });

  // ── Descargar ──
  doc.save(`LOWOODLA-Orden-${orderNum}.pdf`);
  showToast('✅ Factura descargada correctamente', 'success');
  closeCart();
}

// Exponer Cart globalmente para uso en HTML inline
window.Cart = Cart;
window.openCart = openCart;
window.closeCart = closeCart;
window.showToast = showToast;
window.generateInvoicePDF = generateInvoicePDF;
