// ============================================
// SISTEMA DE CARRITO DE COMPRAS - LucarShop
// ============================================

// Configuración de WhatsApp
const WHATSAPP_NUMBER = '50259151412'; // CAMBIAR POR TU NÚMERO (formato: código país + número sin +)

// Clase para manejar el carrito
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    // Cargar carrito desde localStorage
    loadCart() {
        const savedCart = localStorage.getItem('lucarshop_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('lucarshop_cart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    // Agregar producto al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} agregado al carrito`, 'success');
    }

    // Eliminar producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Producto eliminado del carrito', 'info');
    }

    // Actualizar cantidad
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
            }
        }
    }

    // Obtener total del carrito
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Obtener cantidad total de items
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Limpiar carrito
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Actualizar UI del carrito
    updateCartUI() {
        // Actualizar badge del contador
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.getTotalItems();
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Actualizar contenido del modal si está abierto
        this.renderCartItems();
    }

    // Renderizar items del carrito en el modal
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const cartActions = document.getElementById('cartActions');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartActions) cartActions.style.display = 'none';
            if (cartTotal) cartTotal.textContent = '$0.00';
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartActions) cartActions.style.display = 'flex';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item-btn" onclick="cart.removeItem('${item.id}')" title="Eliminar">×</button>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        }
    }

    // Generar boleta y enviar por WhatsApp
    generateInvoice() {
        if (this.items.length === 0) {
            this.showNotification('El carrito está vacío', 'error');
            return;
        }

        // Generar mensaje de boleta
        let message = '🛒 *NUEVO PEDIDO - LucarShop*\n\n';
        message += '📋 *DETALLE DEL PEDIDO:*\n';
        message += '━━━━━━━━━━━━━━━━━━━━\n\n';

        this.items.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Cantidad: ${item.quantity}\n`;
            message += `   Precio unitario: $${item.price.toFixed(2)}\n`;
            message += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
        });

        message += '━━━━━━━━━━━━━━━━━━━━\n';
        message += `💰 *TOTAL: $${this.getTotal().toFixed(2)}*\n\n`;
        message += '📞 Por favor, confirme este pedido y proporcione los datos de envío.';

        // Codificar mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Abrir WhatsApp
        window.open(whatsappURL, '_blank');

        // Opcional: Limpiar carrito después de enviar
        // this.clearCart();
        // this.closeCartModal();
    }

    // Abrir modal del carrito
    openCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderCartItems();
            document.body.style.overflow = 'hidden';
        }
    }

    // Cerrar modal del carrito
    closeCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Inicializar eventos
    init() {
        // Actualizar UI al cargar
        this.updateCartUI();

        // Evento para cerrar modal al hacer clic fuera
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('cartModal');
            if (e.target === modal) {
                this.closeCartModal();
            }
        });

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCartModal();
            }
        });
    }
}

// Crear instancia global del carrito
const cart = new ShoppingCart();

// Función para agregar producto al carrito (llamada desde botones)
function addToCart(productData) {
    cart.addItem(productData);
}

// Función para enviar producto por WhatsApp (favoritos)
function addToFavorites(productName) {
    const message = `Hola! Me interesa el producto: *${productName}*. ¿Podrías darme más información?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// Función para abrir el carrito
function openCart() {
    cart.openCartModal();
}

// Función para cerrar el carrito
function closeCart() {
    cart.closeCartModal();
}

// Función para generar boleta
function generateInvoice() {
    cart.generateInvoice();
}