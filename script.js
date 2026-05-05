let wishlistItems = new Set();
let currentDetailProduct = null;
let selectedColorName = null;
let selectedSize = 'M';

function formatPrice(price) {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(price).replace(/\s/g, ' ');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderProductCards() {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';
    
    PRODUCTS_DATA.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-icon') || e.target.closest('.add-btn')) return;
            openProductDetail(product.id);
        });
        
        // Front image array se first image (main) aur second image (hover)
        const mainImage = Array.isArray(product.front_image) ? product.front_image[0] : product.front_image;
        const hoverImage = Array.isArray(product.front_image) && product.front_image[1] ? product.front_image[1] : mainImage;
        
        const stockClass = product.in_stock ? 'in-stock' : 'out-of-stock';
        const stockText = product.in_stock ? 'In Stock' : 'Out of Stock';
        const hasSale = product.sale_price && product.sale_price < product.price;
        const isWished = wishlistItems.has(product.id);
        
        card.innerHTML = `
            <div class="image-container">
                <img class="product-image main-img" src="${mainImage}" alt="${product.name}">
                <img class="product-image hover-img" src="${hoverImage}" alt="${product.name} - hover">
                <button class="wishlist-icon" data-id="${product.id}">${isWished ? '♥' : '♡'}</button>
                ${hasSale ? '<div class="sale-badge">SALE</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-brand">${escapeHtml(product.brand)}</div>
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="price-row">
                    ${hasSale ? `
                        <span class="sale-price">${formatPrice(product.sale_price)}</span>
                        <span class="original-price">${formatPrice(product.price)}</span>
                        <span class="discount">${Math.round((1 - product.sale_price/product.price) * 100)}% OFF</span>
                    ` : `
                        <span class="normal-price">${formatPrice(product.price)}</span>
                    `}
                </div>
                <div class="stock-status ${stockClass}">${stockText}</div>
                <button class="add-btn" data-product="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
                    Add
                </button>
            </div>
        `;
        
        // Hover effect CSS ke liye
        const style = document.createElement('style');
        style.textContent = `
            .product-card .hover-img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .product-card:hover .main-img {
                opacity: 0;
            }
            .product-card:hover .hover-img {
                opacity: 1;
            }
        `;
        card.appendChild(style);
        
        const wishlistBtn = card.querySelector('.wishlist-icon');
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wishlistItems.has(product.id)) {
                wishlistItems.delete(product.id);
                wishlistBtn.classList.remove('active');
                wishlistBtn.textContent = '♡';
            } else {
                wishlistItems.add(product.id);
                wishlistBtn.classList.add('active');
                wishlistBtn.textContent = '♥';
            }
        });
        
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (product.in_stock) {
                const finalPrice = product.sale_price ? product.sale_price : product.price;
                alert(`Added to cart:\n${product.name}\n${formatPrice(finalPrice)}`);
            } else {
                alert('This item is out of stock.');
            }
        });
        
        container.appendChild(card);
    });
}

function openProductDetail(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;
    currentDetailProduct = product;
    
    const colorsArray = product.colors;
    if (colorsArray.length) selectedColorName = colorsArray[0].name;
    selectedSize = 'M';
    
    const catalogContainer = document.getElementById('mainCatalogContainer');
    catalogContainer.style.display = 'none';
    
    let detailOverlay = document.getElementById('detailOverlay');
    if (!detailOverlay) {
        detailOverlay = document.createElement('div');
        detailOverlay.id = 'detailOverlay';
        detailOverlay.className = 'detail-overlay';
        document.body.appendChild(detailOverlay);
    }
    detailOverlay.style.display = 'block';
    
    const hasSale = product.sale_price && product.sale_price < product.price;
    const stockText = product.in_stock ? 'In Stock' : 'Out of Stock';
    const sizes = product.variants || ['XS', 'S', 'M', 'L', 'XL'];
    
    // Front image for detail page (first image from array)
    const mainDetailImage = Array.isArray(product.front_image) ? product.front_image[0] : product.front_image;
    
    // If product is out of stock, disable buttons by adding disabled attribute and class
    const isOutOfStock = !product.in_stock;
    
    detailOverlay.innerHTML = `
        <div class="detail-container">
            <button class="back-btn" id="closeDetailBtn">← Back to Collection</button>
            <div class="detail-layout">
                <div class="detail-gallery">
                    <img class="main-detail-img" id="detailMainImage" src="${mainDetailImage}" alt="${product.name}">
                </div>
                <div class="detail-info">
                    <div class="detail-brand">${escapeHtml(product.brand)}</div>
                    <div class="detail-title">${escapeHtml(product.name)}</div>
                    <div class="detail-price">
                        ${hasSale ? `
                            <span class="detail-sale-price">${formatPrice(product.sale_price)}</span>
                            <span class="detail-original-price">${formatPrice(product.price)}</span>
                            <span class="detail-discount">${Math.round((1 - product.sale_price/product.price) * 100)}% OFF</span>
                        ` : `
                            <span class="detail-regular-price">${formatPrice(product.price)}</span>
                        `}
                    </div>
                    
                    <div class="stock-blackbox">${stockText}</div>
                    
                    <div class="color-section">
                        <span class="color-label">Select Color:</span>
                        <div class="color-options" id="detailColorOptions">
                            ${product.colors.map(color => `
                                <div class="color-chip" data-color="${color.name}">
                                    <div class="color-circle" style="background-color: ${color.code};"></div>
                                    <span>${color.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="size-section">
                        <span class="size-label">Select Size:</span>
                        <div class="size-buttons" id="detailSizeButtons">
                            ${sizes.map(sz => `
                                <button class="size-btn ${selectedSize === sz ? 'selected-size' : ''}" data-size="${sz}" ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>${sz}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-description">
                        <h4>Description</h4>
                        <p>${escapeHtml(product.description)}</p>
                    </div>
                    
                    <div class="cart-buttons">
                        <button class="btn-add-cart" id="detailAddToCart" ${isOutOfStock ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>Add To Cart</button>
                        <button class="btn-checkout" id="detailCheckoutNow" ${isOutOfStock ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>Checkout Now</button>
                    </div>
                    <div class="delivery-note">Delivery & Returns: Free shipping • 15-day exchange • T&C apply</div>
                </div>
            </div>
        </div>
    `;
    
    const backBtn = document.getElementById('closeDetailBtn');
    backBtn.addEventListener('click', () => {
        detailOverlay.style.display = 'none';
        catalogContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });
    
    // Color selection update (only changes border, not image)
    const colorChips = document.querySelectorAll('#detailColorOptions .color-chip');
    const updateColorSelection = (chosenColorName) => {
        selectedColorName = chosenColorName;
        colorChips.forEach(chip => {
            if (chip.getAttribute('data-color') === chosenColorName) {
                chip.classList.add('active-color');
            } else {
                chip.classList.remove('active-color');
            }
        });
    };
    
    colorChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const colorVal = chip.getAttribute('data-color');
            if (colorVal) {
                updateColorSelection(colorVal);
            }
        });
    });
    
    const defaultChip = Array.from(colorChips).find(c => c.getAttribute('data-color') === selectedColorName);
    if (defaultChip) defaultChip.classList.add('active-color');
    
    // Size selection - only if product is in stock
    if (product.in_stock) {
        const sizeBtns = document.querySelectorAll('#detailSizeButtons .size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sz = btn.getAttribute('data-size');
                selectedSize = sz;
                sizeBtns.forEach(b => b.classList.remove('selected-size'));
                btn.classList.add('selected-size');
            });
        });
    }
    
    const addCartDetail = document.getElementById('detailAddToCart');
    if (addCartDetail && product.in_stock) {
        addCartDetail.addEventListener('click', () => {
            const finalPrice = product.sale_price ? product.sale_price : product.price;
            alert(`🛍 Added to cart:\n${product.name}\nColor: ${selectedColorName}\nSize: ${selectedSize}\nPrice: ${formatPrice(finalPrice)}`);
        });
    } else if (addCartDetail && !product.in_stock) {
        addCartDetail.addEventListener('click', () => {
            alert('This product is currently out of stock.');
        });
    }
    
    const checkoutDetail = document.getElementById('detailCheckoutNow');
    if (checkoutDetail && product.in_stock) {
        checkoutDetail.addEventListener('click', () => {
            alert(`Proceeding to checkout:\n${product.name} (${selectedColorName}, ${selectedSize})`);
        });
    } else if (checkoutDetail && !product.in_stock) {
        checkoutDetail.addEventListener('click', () => {
            alert('Cannot checkout: Item is out of stock.');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderProductCards();
});