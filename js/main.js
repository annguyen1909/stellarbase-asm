class ProductPage {
    constructor() {
        this.currentSize = 'M';
        this.currentQuantity = 1;
        this.cart = this.loadCartFromStorage();

        this.elements = {
            mainImage: document.getElementById('mainProductImage'),
            productSku: document.getElementById('productSku'),
            currentPrice: document.getElementById('currentPrice'),
            originalPrice: document.getElementById('originalPrice'),
            saleBadge: document.getElementById('saleBadge'),
            stockInfo: document.getElementById('stockInfo'),
            stockCount: document.getElementById('stockCount'),

            sizeOptions: document.getElementById('sizeOptions'),
            quantityInput: document.getElementById('quantityInput'),
            decreaseQty: document.getElementById('decreaseQty'),
            increaseQty: document.getElementById('increaseQty'),
            addToCartBtn: document.getElementById('addToCartBtn'),

            thumbnails: document.querySelectorAll('.thumbnail'),

            cartToggle: document.getElementById('cartToggle'),
            cartSidebar: document.getElementById('cartSidebar'),
            cartClose: document.getElementById('cartClose'),
            cartOverlay: document.getElementById('cartOverlay'),
            cartItems: document.getElementById('cartItems'),
            cartEmpty: document.getElementById('cartEmpty'),
            cartCount: document.getElementById('cartCount'),
            cartSubtotal: document.getElementById('cartSubtotal'),
            checkoutBtn: document.getElementById('checkoutBtn'),

            toast: document.getElementById('toast'),
            toastContent: document.getElementById('toastContent'),
            descriptionToggle: document.getElementById('descriptionToggle'),
            descriptionContent: document.getElementById('descriptionContent'),
            shippingToggle: document.getElementById('shippingToggle'),
            shippingContent: document.getElementById('shippingContent'),
            returnsToggle: document.getElementById('returnsToggle'),
            returnsContent: document.getElementById('returnsContent')
        };

        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.updateProductDisplay();
            this.updateCartDisplay();
            this.updateSizeAvailability();

            this.validateCartItems();

            console.log('Product page initialized');
        } catch (error) {
            console.error('Failed to initialize product page:', error);
            this.showToast('Failed to load product page', 'error');
        }
    }

    setupEventListeners() {
        this.elements.sizeOptions.addEventListener('click', (e) => {
            const sizeBtn = e.target.closest('.size-option');
            if (sizeBtn && !sizeBtn.classList.contains('disabled')) {
                this.selectSize(sizeBtn.dataset.size);
            }
        });

        this.elements.decreaseQty.addEventListener('click', () => {
            this.updateQuantity(this.currentQuantity - 1);
        });

        this.elements.increaseQty.addEventListener('click', () => {
            this.updateQuantity(this.currentQuantity + 1);
        });

        this.elements.quantityInput.addEventListener('change', (e) => {
            this.updateQuantity(parseInt(e.target.value) || 1);
        });

        this.elements.quantityInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });

        this.elements.addToCartBtn.addEventListener('click', () => {
            this.addToCart();
        });

        this.elements.cartToggle.addEventListener('click', () => {
            this.toggleCart();
        });

        this.elements.cartClose.addEventListener('click', () => {
            this.closeCart();
        });

        this.elements.cartOverlay.addEventListener('click', () => {
            this.closeCart();
        });

        this.elements.descriptionToggle.addEventListener('click', () => {
            this.toggleSection('description');
        });

        this.elements.shippingToggle.addEventListener('click', () => {
            this.toggleSection('shipping');
        });

        this.elements.returnsToggle.addEventListener('click', () => {
            this.toggleSection('returns');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    selectSize(size) {
        console.log(`Selecting size: ${size}`);

        const variant = ProductDataUtils.getVariant(this.currentColor, size);
        if (!variant || variant.stock === 0) {
            this.showToast('This size is out of stock', 'error');
            return;
        }

        this.currentSize = size;

        this.elements.sizeOptions.querySelectorAll('.size-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });

        this.updateProductDisplay();
        this.updateQuantityLimits();
    }
    updateProductDisplay() {
        const variant = ProductDataUtils.getVariant(this.currentColor, this.currentSize);

        if (!variant) {
            console.error('Variant not found');
            return;
        }

        this.elements.productSku.textContent = variant.sku;

        this.elements.currentPrice.textContent = ProductDataUtils.formatPrice(variant.price);

        if (variant.isOnSale && variant.originalPrice) {
            this.elements.originalPrice.textContent = ProductDataUtils.formatPrice(variant.originalPrice);
            this.elements.originalPrice.style.display = 'inline';
            this.elements.saleBadge.style.display = 'inline';
        } else {
            this.elements.originalPrice.style.display = 'none';
            this.elements.saleBadge.style.display = 'none';
        }

        this.elements.stockCount.textContent = variant.stock;

        const isOutOfStock = variant.stock === 0;
        this.elements.addToCartBtn.disabled = isOutOfStock;
        this.elements.addToCartBtn.textContent = isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART';

        if (isOutOfStock) {
            this.elements.stockInfo.innerHTML = '<span style="color: #e74c3c;">Out of Stock</span>';
        } else {
            this.elements.stockInfo.innerHTML = `In Stock: <span id="stockCount">${variant.stock}</span>`;
        }
    }

    updateSizeAvailability() {
        const availableSizes = ProductDataUtils.getAvailableSizes(this.currentColor);

        this.elements.sizeOptions.querySelectorAll('.size-option').forEach(btn => {
            const sizeData = availableSizes.find(s => s.size === btn.dataset.size);
            const isAvailable = sizeData && sizeData.available;

            btn.classList.toggle('disabled', !isAvailable);
            btn.disabled = !isAvailable;

            if (!isAvailable) {
                btn.title = 'Out of stock';
            } else {
                btn.title = '';
            }
        });
    }

    updateQuantity(quantity) {
        const variant = ProductDataUtils.getVariant(this.currentColor, this.currentSize);
        const maxQty = ProductDataUtils.getMaxQuantity(this.currentColor, this.currentSize);

        if (quantity < 1) {
            quantity = 1;
        } else if (quantity > maxQty) {
            quantity = maxQty;
            this.showToast(`Maximum quantity available: ${maxQty}`, 'error');
        }

        this.currentQuantity = quantity;
        this.elements.quantityInput.value = quantity;

        this.updateQuantityLimits();
    }

    updateQuantityLimits() {
        const variant = ProductDataUtils.getVariant(this.currentColor, this.currentSize);
        const maxQty = ProductDataUtils.getMaxQuantity(this.currentColor, this.currentSize);

        this.elements.decreaseQty.disabled = this.currentQuantity <= 1;
        this.elements.increaseQty.disabled = this.currentQuantity >= maxQty || !variant || variant.stock === 0;

        this.elements.quantityInput.max = maxQty;
    }

    addToCart() {
        const variant = ProductDataUtils.getVariant(this.currentColor, this.currentSize);

        if (!variant || variant.stock === 0) {
            this.showToast('Product is out of stock', 'error');
            return;
        }

        if (this.currentQuantity > variant.stock) {
            this.showToast(`Only ${variant.stock} items available`, 'error');
            return;
        }

        const cartItem = {
            id: variant.id,
            productId: productData.id,
            variant: variant,
            color: this.currentColor,
            size: this.currentSize,
            quantity: this.currentQuantity,
            price: variant.price,
            title: productData.title,
            brand: productData.brand,
            image: ProductDataUtils.getColorData(this.currentColor).images.main
        };


        const existingItemIndex = this.cart.findIndex(item => item.id === cartItem.id);

        if (existingItemIndex >= 0) {

            const newQuantity = this.cart[existingItemIndex].quantity + this.currentQuantity;
            if (newQuantity > variant.stock) {
                this.showToast(`Cannot add more. Only ${variant.stock} items available`, 'error');
                return;
            }
            this.cart[existingItemIndex].quantity = newQuantity;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCartToStorage();
        this.updateCartDisplay();

        this.showToast(`Added to cart: ${cartItem.title} (${cartItem.color.toUpperCase()}/${cartItem.size})`, 'success');

        setTimeout(() => this.openCart(), 500);

        console.log('Item added to cart:', cartItem);
    }

    updateCartDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        this.elements.cartCount.textContent = totalItems;

        if (this.cart.length === 0) {
            this.elements.cartItems.style.display = 'none';
            this.elements.cartEmpty.style.display = 'block';
            this.elements.checkoutBtn.disabled = true;
        } else {
            this.elements.cartItems.style.display = 'block';
            this.elements.cartEmpty.style.display = 'none';
            this.elements.checkoutBtn.disabled = false;
        }

        this.renderCartItems();

        this.elements.cartSubtotal.textContent = ProductDataUtils.formatPrice(subtotal);
    }

    renderCartItems() {
        this.elements.cartItems.innerHTML = '';

        this.cart.forEach((item, index) => {
            const cartItemElement = this.createCartItemElement(item, index);
            this.elements.cartItems.appendChild(cartItemElement);
        });
    }

    createCartItemElement(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.brand} ${item.title}</div>
                <div class="cart-item-variant">${item.color.toUpperCase()} / ${item.size}</div>
                <div class="cart-item-price">${ProductDataUtils.formatPrice(item.price)} each</div>
                <div class="cart-item-controls">
                    <div class="cart-quantity-controls">
                        <button class="cart-quantity-btn decrease-cart-qty" data-index="${index}">−</button>
                        <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" max="${item.variant.stock}" data-index="${index}">
                        <button class="cart-quantity-btn increase-cart-qty" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item-btn" data-index="${index}">Remove</button>
                </div>
            </div>
        `;

        this.attachCartItemListeners(itemElement, index);

        return itemElement;
    }
}