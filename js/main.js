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

}