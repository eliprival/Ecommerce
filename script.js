const navToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-navigation');
const chips = document.querySelectorAll('.chip');
const tags = document.querySelectorAll('.tag');
const productCards = Array.from(document.querySelectorAll('.product-card'));
const productSearch = document.querySelector('#product-search');
const sortSelect = document.querySelector('#sort-products');
const yearEl = document.querySelector('#year');

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
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
