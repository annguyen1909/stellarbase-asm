const productData = {
    id: 'nike-nocta-shorts-468051',
    brand: 'NIKE',
    title: 'NOCTA CARDINAL STOCK WOVEN SHORT',
    description: 'These premium shorts feature stretch fabric for comfort and mobility. Lightweight fabric moves sweat away from your skin for quick evaporation, helping you stay dry and comfortable. Designed to feel relaxed through the seat and thighs for a casual fit.',
    fabrication: ['Body: 100% Nylon'],
    sizeAndFit: ['True to size'],
    
    baseSku: '468051',
    basePrice: 85.00,
    currency: 'NZD',
    
    color: {
        name: 'BLACK',
        value: 'black',
        hex: '#000000'
    },
    
    sizes: ['S', 'M', 'L', 'XL'],
    
    variants: [
        {
            id: 'black-s',
            color: 'black',
            size: 'S',
            sku: '468051-BLACK-S',
            price: 85.00,
            originalPrice: null, 
            stock: 15,
            isOnSale: false
        },
        {
            id: 'black-m',
            color: 'black', 
            size: 'M',
            sku: '468051-BLACK-M',
            price: 85.00,
            originalPrice: null,
            stock: 12,
            isOnSale: false
        },
        {
            id: 'black-l',
            color: 'black',
            size: 'L', 
            sku: '468051-BLACK-L',
            price: 85.00,
            originalPrice: null,
            stock: 8,
            isOnSale: false
        },
        {
            id: 'black-xl',
            color: 'black',
            size: 'XL',
            sku: '468051-BLACK-XL', 
            price: 85.00,
            originalPrice: null,
            stock: 5,
            isOnSale: false
        }
    ]
};

const ProductDataUtils = {
    getVariant(size) {
        return productData.variants.find(variant => 
            variant.size === size
        ) || null;
    },

    getColorData() {
        return productData.color;
    },

    isVariantAvailable(size) {
        const variant = this.getVariant(size);
        return variant && variant.stock > 0;
    },

    getAvailableSizes() {
        return productData.sizes.map(size => {
            const variant = this.getVariant(size);
            return {
                size: size,
                available: variant && variant.stock > 0,
                stock: variant ? variant.stock : 0,
                variant: variant
            };
        });
    },
    
    getMaxQuantity(size) {
        const variant = this.getVariant(size);
        return variant ? variant.stock : 0; 
    },
    
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
};
