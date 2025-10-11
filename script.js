const navToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-navigation');
const chips = document.querySelectorAll('.chip');
const tags = document.querySelectorAll('.tag');
const productCards = Array.from(document.querySelectorAll('.product-card'));
const productSearch = document.querySelector('#product-search');
const searchButtons = document.querySelectorAll('[data-search-button]');
const sortSelect = document.querySelector('#sort-products');
const yearEls = document.querySelectorAll('[data-year]');
const initialSearchParam = new URLSearchParams(window.location.search).get('search') || '';

function normalizeText(text = '') {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

const productCatalog = [
    {
        id: 'te-botanico',
        name: 'Té Botánico Nocturno',
        category: 'Bienestar',
        price: 148000,
        url: 'pages/producto-te-botanico.html',
        image: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'té',
            'infusión',
            'relajación',
            'botánico',
            'nocturno',
            'hierbas naturales',
            'rutina de descanso',
        ],
    },
    {
        id: 'jarron-gres',
        name: 'Jarrón Artesanal en Gres',
        category: 'Hogar',
        price: 241000,
        url: 'pages/producto-jarron-gres.html',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'decoración',
            'artesanal',
            'cerámica',
            'hecho a mano',
            'florero',
            'centro de mesa',
        ],
    },
    {
        id: 'morral-weekend',
        name: 'Morral Sendero Weekend',
        category: 'Aire libre',
        price: 498000,
        url: 'pages/producto-morral-weekend.html',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'mochila',
            'viajes',
            'aventura',
            'impermeable',
            'capacidad amplia',
            'excursiones',
        ],
    },
    {
        id: 'parlante-nordic',
        name: 'Parlante Nordic Sound',
        category: 'Tecnología',
        price: 346000,
        url: 'pages/producto-parlante-nordic.html',
        image: 'https://images.unsplash.com/photo-1490376840453-5f616fbebe5b?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'audio',
            'bluetooth',
            'inalámbrico',
            'sonido premium',
            'diseño nórdico',
            'minimalista',
        ],
    },
    {
        id: 'elixir-radiante',
        name: 'Elixir Facial Radiante',
        category: 'Belleza',
        price: 94000,
        url: 'pages/producto-elixir-radiante.html',
        image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'cuidado facial',
            'serum',
            'piel luminosa',
            'aceites naturales',
            'rutina de belleza',
            'antioxidantes',
        ],
    },
    {
        id: 'manta-costera',
        name: 'Manta Costera en Lino',
        category: 'Hogar',
        price: 210000,
        url: 'pages/producto-manta-costera.html',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'textiles',
            'mantas',
            'decoración',
            'lino',
            'acolchado',
            'acogedor',
        ],
    },
    {
        id: 'set-aromaterapia',
        name: 'Set de Aromaterapia Ritual',
        category: 'Bienestar',
        price: 187000,
        url: 'pages/producto-set-aromaterapia.html',
        image: 'https://images.unsplash.com/photo-1526413232644-8a3f83f3d6eb?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'aceites esenciales',
            'aromaterapia',
            'relajación',
            'spa en casa',
            'rituales',
            'bienestar',
        ],
    },
    {
        id: 'set-picnic',
        name: 'Set de Picnic Evergreen',
        category: 'Aire libre',
        price: 296000,
        url: 'pages/producto-set-picnic.html',
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f2387?auto=format&fit=crop&w=800&q=80',
        keywords: [
            'picnic',
            'kit completo',
            'camping',
            'aire libre',
            'familia',
            'plan de fin de semana',
        ],
    },
].map((product, index) => {
    const keywords = Array.from(new Set([product.category, ...(product.keywords || [])])).filter(Boolean);
    return {
        ...product,
        keywords,
        normalizedName: normalizeText(product.name),
        normalizedKeywords: normalizeText([product.name, product.category, ...keywords].join(' ')),
        order: index,
    };
});

let searchOverlayElements = null;
let lastFocusedElement = null;

productCards.forEach((card) => {
    const productId = card.dataset.productId;

    if (!productId) {
        return;
    }

    const entry = productCatalog.find((product) => product.id === productId);
    const fallbackName = card.querySelector('h3')?.textContent?.trim();
    const fallbackCategory = card.querySelector('.product-card__category')?.textContent?.trim();
    const cardKeywords = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
    const cardUrl = card.dataset.productUrl || card.querySelector('.product-card__link')?.getAttribute('href') || '';
    const cardImage = card.dataset.productImage || card.querySelector('img')?.src || '';
    const priceValue = Number.parseInt(card.dataset.productPrice || '0', 10);

    if (entry) {
        entry.name = entry.name || fallbackName || '';
        entry.category = entry.category || fallbackCategory || '';
        entry.url = entry.url || cardUrl;
        entry.image = entry.image || cardImage;
        entry.price = entry.price || (Number.isNaN(priceValue) ? 0 : priceValue);
        entry.keywords = Array.from(new Set([...(entry.keywords || []), ...cardKeywords, entry.category].filter(Boolean)));
        entry.normalizedName = normalizeText(entry.name);
        entry.normalizedKeywords = normalizeText([entry.name, entry.category, ...(entry.keywords || [])].join(' '));
    } else {
        const keywords = Array.from(new Set([fallbackCategory, ...cardKeywords].filter(Boolean)));
        const newEntry = {
            id: productId,
            name: fallbackName || '',
            category: fallbackCategory || '',
            price: Number.isNaN(priceValue) ? 0 : priceValue,
            url: cardUrl,
            image: cardImage,
            keywords,
            order: productCatalog.length,
            normalizedName: normalizeText(fallbackName || ''),
            normalizedKeywords: normalizeText([fallbackName || '', fallbackCategory || '', ...keywords].join(' ')),
        };
        productCatalog.push(newEntry);
    }
});

const defaultSearchSuggestions = productCatalog
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

function resolveProductUrl(url) {
    if (!url) {
        return '#';
    }

    if (/^(https?:)?\/\//.test(url) || url.startsWith('/')) {
        return url;
    }

    if (window.location.pathname.includes('/pages/')) {
        if (url.startsWith('../')) {
            return safePath(url);
        }

        if (url.startsWith('pages/')) {
            return safePath(`../${url}`);
        }

        return safePath(url);
    }

    return safePath(url);
}

function highlightMatch(text, query) {
    if (!query) {
        return text;
    }

    const terms = query
        .split(/\s+/)
        .filter(Boolean)
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (terms.length === 0) {
        return text;
    }

    const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
    return text.replace(pattern, '<mark>$1</mark>');
}

function searchProducts(query) {
    const normalizedQuery = normalizeText(query.trim());

    if (!normalizedQuery) {
        return defaultSearchSuggestions;
    }

    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTerms.length === 0) {
        return defaultSearchSuggestions;
    }

    const matches = productCatalog
        .map((product) => {
            let score = 0;

            for (const term of queryTerms) {
                const keywordIndex = product.normalizedKeywords.indexOf(term);

                if (keywordIndex === -1) {
                    score = -1;
                    break;
                }

                score += keywordIndex === 0 ? 3 : 1;

                if (product.normalizedName.startsWith(term)) {
                    score += 2;
                }
            }

            return { product, score };
        })
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score || a.product.order - b.product.order);

    if (matches.length === 0) {
        return [];
    }

    return matches.slice(0, 6).map((entry) => entry.product);
}

function updateSearchSuggestions(query = '') {
    if (!searchOverlayElements) {
        return;
    }

    const { resultsList, emptyState } = searchOverlayElements;
    const results = searchProducts(query);

    if (results.length === 0) {
        resultsList.innerHTML = '';
        resultsList.hidden = true;

        if (emptyState) {
            emptyState.hidden = false;
            emptyState.textContent = query
                ? `No encontramos coincidencias para “${query}”. Prueba con palabras como manta, aromaterapia o parlante.`
                : 'Escribe el nombre de un producto o categoría para ver sugerencias disponibles.';
        }

        return;
    }

    const fragment = document.createDocumentFragment();

    results.forEach((product) => {
        const item = document.createElement('li');
        item.className = 'search-overlay__result';
        item.setAttribute('role', 'option');

        const link = document.createElement('a');
        link.className = 'search-overlay__result-link';
        link.href = resolveProductUrl(product.url);
        link.setAttribute('data-search-result', product.id);

        const preview = document.createElement('div');
        preview.className = 'search-overlay__result-preview';

        if (product.image) {
            const image = document.createElement('img');
            image.src = product.image;
            image.alt = '';
            image.loading = 'lazy';
            preview.append(image);
        }

        const content = document.createElement('div');
        content.className = 'search-overlay__result-content';

        const title = document.createElement('p');
        title.className = 'search-overlay__result-title';
        title.innerHTML = highlightMatch(product.name, query);

        const meta = document.createElement('p');
        meta.className = 'search-overlay__result-meta';
        const metaParts = [product.category].filter(Boolean);

        if (product.price) {
            metaParts.push(formatCurrency(product.price));
        }

        meta.textContent = metaParts.join(' · ');

        content.append(title, meta);

        if (product.keywords?.length) {
            const tags = document.createElement('p');
            tags.className = 'search-overlay__result-tags';
            product.keywords.slice(0, 3).forEach((keyword) => {
                const tag = document.createElement('span');
                tag.className = 'search-overlay__result-tag';
                tag.textContent = keyword;
                tags.append(tag);
            });
            content.append(tags);
        }

        link.append(preview, content);
        item.append(link);
        fragment.append(item);
    });

    resultsList.innerHTML = '';
    resultsList.append(fragment);
    resultsList.hidden = false;

    if (emptyState) {
        emptyState.hidden = true;
    }
}

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

if (productSearch && initialSearchParam) {
    productSearch.value = initialSearchParam;
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
    const datalistId = productSearch.id ? `${productSearch.id}-sugerencias` : 'product-search-sugerencias';
    let dataList = document.getElementById(datalistId);

    if (!dataList) {
        dataList = document.createElement('datalist');
        dataList.id = datalistId;

        if (productSearch.parentElement) {
            productSearch.parentElement.appendChild(dataList);
        } else {
            document.body.appendChild(dataList);
        }
    }

    const keywordSet = new Set();
    productCatalog.forEach((product) => {
        if (product.name) {
            keywordSet.add(product.name);
        }

        (product.keywords || []).forEach((keyword) => {
            if (keyword) {
                keywordSet.add(keyword);
            }
        });
    });

    dataList.innerHTML = '';
    Array.from(keywordSet)
        .slice(0, 24)
        .forEach((term) => {
            const option = document.createElement('option');
            option.value = term;
            dataList.append(option);
        });

    productSearch.setAttribute('list', datalistId);

    productSearch.addEventListener('input', (event) => {
        filterProducts({ category: document.querySelector('.chip.is-active')?.dataset.filter || 'all', search: event.target.value });
    });

    productSearch.form?.addEventListener('submit', (event) => {
        event.preventDefault();
        filterProducts({ category: document.querySelector('.chip.is-active')?.dataset.filter || 'all', search: productSearch.value });
    });
}

function handleSearchOverlayKeydown(event) {
    if (event.key === 'Escape') {
        closeSearchOverlay();
    }
}

function getIndexPath() {
    return window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
}

function ensureSearchOverlay() {
    if (searchOverlayElements) {
        return searchOverlayElements;
    }

    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.setAttribute('data-search-overlay', '');
    overlay.setAttribute('aria-hidden', 'true');

    const dialog = document.createElement('div');
    dialog.className = 'search-overlay__dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'search-overlay-title');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'search-overlay__close';
    closeButton.setAttribute('data-search-close', '');
    closeButton.setAttribute('aria-label', 'Cerrar búsqueda');
    closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
        </svg>
    `;

    const title = document.createElement('h2');
    title.id = 'search-overlay-title';
    title.className = 'search-overlay__title';
    title.textContent = 'Buscar en La Botica';

    const form = document.createElement('form');
    form.className = 'search-overlay__form';
    form.setAttribute('data-search-form', '');
    form.setAttribute('role', 'search');

    const field = document.createElement('div');
    field.className = 'search-overlay__field';

    const label = document.createElement('label');
    label.className = 'sr-only';
    label.setAttribute('for', 'search-overlay-input');
    label.textContent = 'Buscar productos';

    const input = document.createElement('input');
    input.type = 'search';
    input.id = 'search-overlay-input';
    input.name = 'search';
    input.setAttribute('data-search-input', '');
    input.placeholder = 'Busca productos, categorías o artículos';
    input.autocomplete = 'off';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn--small';
    submitButton.textContent = 'Buscar';

    const hint = document.createElement('p');
    hint.className = 'search-overlay__hint';
    hint.textContent = 'Sugerencia: escribe palabras como “aromaterapia”, “manta” o “morral” para ver coincidencias.';

    const resultsList = document.createElement('ul');
    resultsList.className = 'search-overlay__results';
    resultsList.setAttribute('role', 'listbox');
    resultsList.hidden = true;

    const emptyState = document.createElement('p');
    emptyState.className = 'search-overlay__empty';
    emptyState.hidden = true;
    emptyState.setAttribute('aria-live', 'polite');

    field.append(label, input, submitButton);
    form.append(field);
    dialog.append(closeButton, title, form, hint, resultsList, emptyState);
    overlay.append(dialog);
    document.body.append(overlay);

    closeButton.addEventListener('click', () => {
        closeSearchOverlay();
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeSearchOverlay();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();

        if (productSearch) {
            productSearch.value = query;
            closeSearchOverlay();
            filterProducts({
                category: document.querySelector('.chip.is-active')?.dataset.filter || 'all',
                search: query,
            });
            productSearch.focus();
            return;
        }

        const destinationUrl = new URL(getIndexPath(), window.location.href);

        if (query) {
            destinationUrl.searchParams.set('search', query);
        } else {
            destinationUrl.search = '';
        }

        closeSearchOverlay();
        window.location.href = destinationUrl.toString();
    });

    input.addEventListener('input', () => {
        updateSearchSuggestions(input.value);
    });

    resultsList.addEventListener('click', (event) => {
        const link = event.target.closest('[data-search-result]');
        if (!link) {
            return;
        }

        closeSearchOverlay();
    });

    searchOverlayElements = { overlay, input, resultsList, emptyState };
    updateSearchSuggestions(input.value);
    return searchOverlayElements;
}

function openSearchOverlay(trigger) {
    const { overlay, input } = ensureSearchOverlay();

    lastFocusedElement = trigger || document.activeElement;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-search-overlay');

    input.value = productSearch?.value || initialSearchParam || '';
    updateSearchSuggestions(input.value);

    requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        input.select();
    });

    document.addEventListener('keydown', handleSearchOverlayKeydown);
}

function closeSearchOverlay() {
    if (!searchOverlayElements) {
        return;
    }

    const { overlay } = searchOverlayElements;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-search-overlay');
    document.removeEventListener('keydown', handleSearchOverlayKeydown);

    if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
    }
}

if (searchButtons.length > 0) {
    searchButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            openSearchOverlay(button);
        });
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
filterProducts({ category: 'all', search: productSearch?.value || initialSearchParam || '' });
sortProducts(sortSelect?.value || 'featured');

productCards.forEach((card) => {
    const cardLink = card.querySelector('.product-card__link');
    const destination = cardLink?.getAttribute('href') || card.dataset.productUrl;

    if (!destination) {
        return;
    }

    card.classList.add('product-card--interactive');

    if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
    }

    if (!card.hasAttribute('role')) {
        card.setAttribute('role', 'link');
    }

    if (!card.hasAttribute('aria-label')) {
        const label = card.dataset.productName || card.querySelector('h3')?.textContent?.trim();
        if (label) {
            card.setAttribute('aria-label', label);
        }
    }

    card.addEventListener('click', (event) => {
        const interactiveTarget = event.target.closest('a, button, input, select, textarea');

        if (interactiveTarget) {
            if (interactiveTarget === cardLink) {
                return;
            }

            // Allow buttons (como "Agregar al carrito") a manejar su propio flujo
            return;
        }

        window.location.href = safePath(destination);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const interactiveTarget = event.target.closest('button, a, input, select, textarea');

        if (interactiveTarget) {
            return;
        }

        event.preventDefault();
        window.location.href = safePath(destination);
    });
});

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

const CART_KEY = 'labotica.cart.v1';
const CHECKOUT_KEY = 'labotica.checkout.v1';
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

