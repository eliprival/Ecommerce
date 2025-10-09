const navToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-navigation');
const chips = document.querySelectorAll('.chip');
const tags = document.querySelectorAll('.tag');
const productCards = Array.from(document.querySelectorAll('.product-card'));
const productSearch = document.querySelector('#product-search');
const sortSelect = document.querySelector('#sort-products');
const yearEls = document.querySelectorAll('[data-year]');

if (yearEls.length > 0) {
    const currentYear = new Date().getFullYear();
    yearEls.forEach((element) => {
        element.textContent = currentYear;
    });
}

if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });
}

function resetActiveChips(activeButton) {
    [...chips].forEach((chip) => chip.classList.toggle('is-active', chip === activeButton));
}

function filterProducts({ category = 'all', tag = '', search = '' } = {}) {
    const normalizedSearch = search.trim().toLowerCase();

    productCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const cardTags = card.dataset.tags || '';
        const cardText = card.innerText.toLowerCase();

        const categoryMatch = category === 'all' || cardCategory === category;
        const tagMatch = !tag || cardTags.includes(tag);
        const searchMatch = !normalizedSearch || cardText.includes(normalizedSearch);

        const shouldShow = categoryMatch && tagMatch && searchMatch;
        card.style.display = shouldShow ? '' : 'none';
    });
}

chips.forEach((chip) => {
    chip.addEventListener('click', () => {
        const filterValue = chip.dataset.filter || 'all';
        resetActiveChips(chip);
        filterProducts({ category: filterValue, search: productSearch.value });
    });
});

tags.forEach((tag) => {
    tag.addEventListener('click', () => {
        const filterValue = tag.dataset.filter || '';
        filterProducts({ tag: filterValue, search: productSearch.value });
    });
});

if (productSearch) {
    productSearch.addEventListener('input', (event) => {
        filterProducts({ category: document.querySelector('.chip.is-active')?.dataset.filter || 'all', search: event.target.value });
    });

    productSearch.form?.addEventListener('submit', (event) => {
        event.preventDefault();
        filterProducts({ category: document.querySelector('.chip.is-active')?.dataset.filter || 'all', search: productSearch.value });
    });
}

function sortProducts(criteria) {
    const grid = document.querySelector('#product-grid');
    if (!grid) return;

    const sortedCards = [...productCards].sort((a, b) => {
        const priceA = Number.parseFloat(a.dataset.price || '0');
        const priceB = Number.parseFloat(b.dataset.price || '0');
        const textA = a.querySelector('h3')?.textContent.trim().toLowerCase() || '';
        const textB = b.querySelector('h3')?.textContent.trim().toLowerCase() || '';

        switch (criteria) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'new':
                return Math.random() - 0.5;
            default:
                return textA.localeCompare(textB);
        }
    });

    sortedCards.forEach((card) => grid.appendChild(card));
}

if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
        sortProducts(event.target.value);
    });
}

// Ensure default state is visible on load
filterProducts({ category: 'all' });
sortProducts(sortSelect?.value || 'featured');

const galleries = document.querySelectorAll('[data-gallery]');

galleries.forEach((gallery) => {
    const previewImage = gallery.querySelector('[data-gallery-current]');
    const thumbnails = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
    const prevButton = gallery.querySelector('[data-gallery-prev]');
    const nextButton = gallery.querySelector('[data-gallery-next]');
    const indicator = gallery.querySelector('[data-gallery-indicator]');
    const preview = gallery.querySelector('.product-gallery__preview');

    if (!previewImage || thumbnails.length === 0 || !preview) {
        return;
    }

    let currentIndex = 0;

    function updateSlide(newIndex) {
        if (!thumbnails.length) return;

        currentIndex = (newIndex + thumbnails.length) % thumbnails.length;
        const activeThumb = thumbnails[currentIndex];
        const imageSrc = activeThumb.dataset.image;
        const imageAlt = activeThumb.dataset.alt || previewImage.alt;

        if (imageSrc) {
            previewImage.src = imageSrc;
        }

        previewImage.alt = imageAlt;

        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('is-active', index === currentIndex);
        });

        if (indicator) {
            indicator.textContent = `${currentIndex + 1} / ${thumbnails.length}`;
        }
    }

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => updateSlide(index));
    });

    const showNext = () => updateSlide(currentIndex + 1);
    const showPrev = () => updateSlide(currentIndex - 1);

    nextButton?.addEventListener('click', showNext);
    prevButton?.addEventListener('click', showPrev);

    let startX = 0;

    preview.addEventListener(
        'touchstart',
        (event) => {
            startX = event.touches[0]?.clientX ?? 0;
        },
        { passive: true }
    );

    preview.addEventListener(
        'touchend',
        (event) => {
            const endX = event.changedTouches[0]?.clientX ?? startX;
            const deltaX = endX - startX;

            if (Math.abs(deltaX) > 40) {
                if (deltaX < 0) {
                    showNext();
                } else {
                    showPrev();
                }
            }
        },
        { passive: true }
    );

    updateSlide(0);
});

const CART_KEY = 'northwind.cart.v1';
const CHECKOUT_KEY = 'northwind.checkout.v1';
const cartCountElements = document.querySelectorAll('[data-cart-count]');
const currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

function formatCurrency(value) {
    return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function safePath(relativePath) {
    try {
        return new URL(relativePath, window.location.href).pathname;
    } catch (error) {
        return relativePath;
    }
}

function getCart() {
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + (item.quantity || 0), 0);
    cartCountElements.forEach((element) => {
        element.textContent = String(count);
    });
}

function findProductSource(element) {
    if (!element) return null;
    if (element.dataset.productId) {
        return element;
    }
    return element.closest('[data-product-id]');
}

function getProductDataFromElement(element) {
    const source = findProductSource(element);
    if (!source) {
        return null;
    }

    const priceValue = Number.parseInt(source.dataset.productPrice || '0', 10);

    return {
        id: source.dataset.productId,
        name: source.dataset.productName,
        price: Number.isNaN(priceValue) ? 0 : priceValue,
        image: source.dataset.productImage,
        url: source.dataset.productUrl ? safePath(source.dataset.productUrl) : window.location.pathname,
    };
}

function addItemToCart(product, quantity = 1) {
    if (!product || !product.id) {
        return;
    }

    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    setCart(cart);
}

function setCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === productId);

    if (!item) {
        return;
    }

    item.quantity = Math.max(1, quantity);
    setCart(cart);
}

function removeCartItem(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    setCart(cart);
}

let cartToastTimeout;

function showCartToast(message) {
    if (!message) return;

    let toast = document.querySelector('[data-cart-toast]');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.dataset.cartToast = 'true';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(cartToastTimeout);
    cartToastTimeout = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2400);
}

const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
addToCartButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const product = getProductDataFromElement(button);
        if (!product) return;

        addItemToCart(product, 1);
        showCartToast(`${product.name || 'Producto'} se agregó al carrito.`);
    });
});

const buyNowButtons = document.querySelectorAll('[data-buy-now]');
buyNowButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const product = getProductDataFromElement(button);
        if (!product) return;

        addItemToCart(product, 1);
        const checkoutPath = window.location.pathname.includes('/pages/')
            ? 'checkout.html'
            : 'pages/checkout.html';
        window.location.href = safePath(checkoutPath);
    });
});

function buildCartItemTemplate(item) {
    const itemTotal = item.price * item.quantity;
    const image = item.image
        ? `<img src="${item.image}" alt="${item.name}" loading="lazy" />`
        : '';

    return `
        <li class="cart-item" data-cart-item="${item.id}">
            <div class="cart-item__media">
                ${image}
            </div>
            <div class="cart-item__details">
                <div class="cart-item__header">
                    <a class="cart-item__title" href="${item.url || '#'}">${item.name}</a>
                    <button class="cart-item__remove" type="button" data-cart-remove aria-label="Eliminar ${item.name}">
                        Eliminar
                    </button>
                </div>
                <p class="cart-item__price">${formatCurrency(item.price)}</p>
                <div class="cart-item__controls">
                    <div class="quantity-control" aria-label="Cantidad">
                        <button class="quantity-control__btn" type="button" data-cart-decrease aria-label="Disminuir cantidad">
                            &minus;
                        </button>
                        <input class="quantity-control__input" type="number" min="1" inputmode="numeric" value="${item.quantity}" data-cart-quantity-input aria-label="Cantidad para ${item.name}" />
                        <button class="quantity-control__btn" type="button" data-cart-increase aria-label="Aumentar cantidad">
                            +
                        </button>
                    </div>
                    <span class="cart-item__line-total">${formatCurrency(itemTotal)}</span>
                </div>
            </div>
        </li>
    `;
}

function renderCartPage() {
    const cartPage = document.querySelector('[data-cart-page]');
    if (!cartPage) return;

    const itemsContainer = cartPage.querySelector('[data-cart-items]');
    const emptyState = cartPage.querySelector('[data-cart-empty]');
    const content = cartPage.querySelector('[data-cart-content]');
    const subtotalElement = cartPage.querySelector('[data-cart-subtotal]');
    const totalElement = cartPage.querySelector('[data-cart-total]');
    const checkoutButton = cartPage.querySelector('[data-checkout-button]');

    if (checkoutButton?.tagName === 'A') {
        checkoutButton.addEventListener('click', (event) => {
            if (!getCart().length) {
                event.preventDefault();
            }
        });
    }

    function updateCartUI() {
        const cartItems = getCart();
        const hasItems = cartItems.length > 0;

        if (emptyState) {
            emptyState.hidden = hasItems;
        }

        if (content) {
            content.hidden = !hasItems;
        }

        if (checkoutButton) {
            const disabled = !hasItems;
            if (checkoutButton.tagName === 'A') {
                checkoutButton.classList.toggle('is-disabled', disabled);
                checkoutButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
                checkoutButton.tabIndex = disabled ? -1 : 0;
            } else {
                checkoutButton.disabled = disabled;
            }
        }

        if (!itemsContainer) {
            return;
        }

        if (!hasItems) {
            itemsContainer.innerHTML = '';
        } else {
            itemsContainer.innerHTML = cartItems.map((item) => buildCartItemTemplate(item)).join('');
        }

        const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        if (subtotalElement) {
            subtotalElement.textContent = formatCurrency(subtotal);
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(subtotal);
        }
    }

    updateCartUI();

    itemsContainer?.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('[data-cart-item]');
        if (!row) return;
        const itemId = row.dataset.cartItem;
        if (!itemId) return;

        if (target.closest('[data-cart-increase]')) {
            const current = getCart().find((item) => item.id === itemId)?.quantity || 1;
            setCartItemQuantity(itemId, current + 1);
            updateCartUI();
        }

        if (target.closest('[data-cart-decrease]')) {
            const current = getCart().find((item) => item.id === itemId)?.quantity || 1;
            setCartItemQuantity(itemId, Math.max(1, current - 1));
            updateCartUI();
        }

        if (target.closest('[data-cart-remove]')) {
            removeCartItem(itemId);
            updateCartUI();
            showCartToast('Producto eliminado del carrito.');
        }
    });

    itemsContainer?.addEventListener('change', (event) => {
        const input = event.target.closest('[data-cart-quantity-input]');
        if (!input) return;

        const row = input.closest('[data-cart-item]');
        if (!row) return;

        const itemId = row.dataset.cartItem;
        const parsedValue = Number.parseInt(input.value || '1', 10);

        if (Number.isNaN(parsedValue) || parsedValue < 1) {
            const current = getCart().find((item) => item.id === itemId)?.quantity || 1;
            input.value = String(current);
            return;
        }

        setCartItemQuantity(itemId, parsedValue);
        updateCartUI();
    });
}

function buildSummaryItem(item) {
    const lineTotal = item.price * item.quantity;
    return `
        <li class="summary-item">
            <span>
                <strong>${item.name}</strong>
                <small>x${item.quantity}</small>
            </span>
            <span>${formatCurrency(lineTotal)}</span>
        </li>
    `;
}

function renderCheckoutPage() {
    const checkoutPage = document.querySelector('[data-checkout-page]');
    if (!checkoutPage) return;

    const form = checkoutPage.querySelector('[data-checkout-form]');
    const itemsContainer = checkoutPage.querySelector('[data-checkout-items]');
    const subtotalElement = checkoutPage.querySelector('[data-checkout-subtotal]');
    const totalElement = checkoutPage.querySelector('[data-checkout-total]');
    const summarySection = checkoutPage.querySelector('[data-checkout-summary]');
    const emptyNotice = checkoutPage.querySelector('[data-checkout-empty]');

    const cartItems = getCart();
    const hasItems = cartItems.length > 0;
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (emptyNotice) {
        emptyNotice.hidden = hasItems;
    }

    if (summarySection) {
        summarySection.hidden = !hasItems;
    }

    const submitButton = form?.querySelector('[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !hasItems;
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = hasItems ? cartItems.map((item) => buildSummaryItem(item)).join('') : '';
    }

    if (subtotalElement) {
        subtotalElement.textContent = formatCurrency(subtotal);
    }

    if (totalElement) {
        totalElement.textContent = formatCurrency(subtotal);
    }

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!hasItems) {
            return;
        }

        const formData = new FormData(form);
        const checkoutData = {
            id: `NW-${Math.random().toString(36).slice(-6).toUpperCase()}`,
            submittedAt: new Date().toISOString(),
            customer: {
                nombre: formData.get('nombre') || '',
                apellido: formData.get('apellido') || '',
                email: formData.get('email') || '',
                telefono: formData.get('telefono') || '',
                direccion: formData.get('direccion') || '',
                ciudad: formData.get('ciudad') || '',
                departamento: formData.get('departamento') || '',
                codigoPostal: formData.get('codigo_postal') || '',
                notas: formData.get('notas') || '',
            },
            pago: formData.get('metodo_pago') || 'tarjeta',
            items: getCart(),
            subtotal,
            total: subtotal,
        };

        localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkoutData));

        const confirmationPath = window.location.pathname.includes('/pages/')
            ? 'confirmacion.html'
            : 'pages/confirmacion.html';

        window.location.href = safePath(confirmationPath);
    });
}

function renderConfirmationPage() {
    const confirmationPage = document.querySelector('[data-confirmation-page]');
    if (!confirmationPage) return;

    const dataRaw = localStorage.getItem(CHECKOUT_KEY);
    if (!dataRaw) {
        confirmationPage.innerHTML = `
            <div class="container confirmation-page__empty">
                <h1>Tu pedido está vacío</h1>
                <p>No encontramos un pedido reciente. Explora nuestros productos y crea una nueva orden.</p>
                <a class="btn" href="${safePath(window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html')}">
                    Ir a la tienda
                </a>
            </div>
        `;
        setCart([]);
        localStorage.removeItem(CHECKOUT_KEY);
        return;
    }

    const data = JSON.parse(dataRaw);

    const itemsList = data.items
        .map(
            (item) => `
                <li class="summary-item">
                    <span>
                        <strong>${item.name}</strong>
                        <small>x${item.quantity}</small>
                    </span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                </li>
            `
        )
        .join('');

    confirmationPage.innerHTML = `
        <div class="container confirmation-page__inner">
            <header class="confirmation-page__header">
                <h1>¡Gracias por tu compra!</h1>
                <p>Pedido <strong>${data.id}</strong></p>
                <p>Enviamos la confirmación a <strong>${data.customer.email || 'tu correo'}</strong>.</p>
            </header>
            <div class="confirmation-page__grid">
                <section class="confirmation-card">
                    <h2>Detalles de envío</h2>
                    <p>${data.customer.nombre} ${data.customer.apellido}</p>
                    <p>${data.customer.direccion}</p>
                    <p>${data.customer.ciudad}, ${data.customer.departamento} ${data.customer.codigoPostal}</p>
                    <p>Teléfono: ${data.customer.telefono || 'No informado'}</p>
                    <p>Método de pago: ${data.pago === 'nequi' ? 'Nequi' : data.pago === 'pse' ? 'PSE' : 'Tarjeta de crédito o débito'}</p>
                    ${data.customer.notas ? `<p>Notas: ${data.customer.notas}</p>` : ''}
                </section>
                <section class="confirmation-card">
                    <h2>Resumen del pedido</h2>
                    <ul class="summary-list">${itemsList}</ul>
                    <div class="summary-total">
                        <span>Total pagado</span>
                        <strong>${formatCurrency(data.total)}</strong>
                    </div>
                    <a class="btn btn--ghost" href="${safePath(window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html')}">
                        Seguir explorando
                    </a>
                </section>
            </div>
        </div>
    `;

    setCart([]);
    localStorage.removeItem(CHECKOUT_KEY);
    updateCartCount();
}

renderCartPage();
renderCheckoutPage();
renderConfirmationPage();
updateCartCount();

