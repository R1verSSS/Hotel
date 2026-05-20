function changeImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage || !thumbnail) return;

    mainImage.classList.add('is-changing');

    setTimeout(() => {
        mainImage.src = thumbnail.src;
        mainImage.alt = thumbnail.alt || mainImage.alt;
        mainImage.classList.remove('is-changing');
    }, 120);

    document.querySelectorAll('.thumbnail').forEach((item) => {
        item.classList.remove('active');
    });

    thumbnail.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {

    const burgerBtn = document.querySelector('.burger-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // =========================
    // DARK MODE
    // =========================
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('hotel-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');

        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
            themeToggle.setAttribute('title', theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');
        }
    }

    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('hotel-theme', nextTheme);
            applyTheme(nextTheme);
            showToast(nextTheme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена', '', 'info', 1800);
        });
    }

    const roomMiniImages = {
        'Стандарт': 'images/standart-mini.png',
        'Люкс': 'images/lux-mini.png',
        'Семейный': 'images/family-mini.png',
        'Делюкс': 'images/deluxe-mini.png'
    };

    function getMiniImageByTitle(title) {
        return roomMiniImages[title] || 'images/standart-mini.png';
    }

    function formatMoney(value) {
        return `${Number(value || 0).toLocaleString('ru-RU')} ₽`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}.${month}.${year}`;
    }

    function getNoun(number, one, two, five) {
        let n = Math.abs(Number(number));
        n %= 100;

        if (n >= 5 && n <= 20) return five;

        n %= 10;

        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;

        return five;
    }

    function getNightsCount(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return 1;
        }

        const diff = end - start;
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return Math.max(nights, 1);
    }

    function getRoomTitle() {
        return (
            document.querySelector('.room-detail-title')?.innerText ||
            document.querySelector('.room-title')?.innerText ||
            'Номер'
        ).trim();
    }

    function getRoomPrice() {
        const priceText =
            document.querySelector('.price-value')?.innerText ||
            document.querySelector('.price-val')?.innerText ||
            '0 ₽';

        return parseInt(priceText.replace(/\D/g, ''), 10) || 0;
    }

    // =========================
    // ФИЛЬТРЫ НА ГЛАВНОЙ
    // =========================
    const filterGuests = document.getElementById('filter-guests');
    const filterPrice = document.getElementById('filter-price');
    const filterType = document.getElementById('filter-type');
    const filterReset = document.getElementById('filter-reset');
    const filterResult = document.getElementById('filter-result');
    const roomCards = document.querySelectorAll('#rooms-grid .room-card[data-price]');

    function updateRoomFilters() {
        if (!roomCards.length) return;

        const guestsValue = filterGuests?.value || 'all';
        const priceValue = filterPrice?.value || 'all';
        const typeValue = filterType?.value || 'all';
        let visibleCount = 0;

        roomCards.forEach((card) => {
            const guests = Number(card.dataset.guests || 0);
            const price = Number(card.dataset.price || 0);
            const type = card.dataset.type || '';

            const matchGuests = guestsValue === 'all' || guests <= Number(guestsValue);
            const matchPrice = priceValue === 'all' || price <= Number(priceValue);
            const matchType = typeValue === 'all' || type === typeValue;
            const isVisible = matchGuests && matchPrice && matchType;

            card.classList.toggle('is-hidden-by-filter', !isVisible);
            if (isVisible) visibleCount += 1;
        });

        if (filterResult) {
            filterResult.innerText = visibleCount > 0
                ? `Найдено номеров: ${visibleCount}`
                : 'По выбранным фильтрам номеров не найдено';
        }
    }

    [filterGuests, filterPrice, filterType].forEach((control) => {
        control?.addEventListener('change', updateRoomFilters);
    });

    filterReset?.addEventListener('click', () => {
        if (filterGuests) filterGuests.value = 'all';
        if (filterPrice) filterPrice.value = 'all';
        if (filterType) filterType.value = 'all';
        updateRoomFilters();
    });

    updateRoomFilters();

    // =========================
    // SLIDER GALLERY НА СТРАНИЦЕ НОМЕРА
    // =========================
    const galleryContainer = document.querySelector('.main-image-container');
    const mainImage = document.getElementById('mainImage');
    const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));

    if (galleryContainer && mainImage && thumbnails.length > 1) {
        let activeSlide = Math.max(0, thumbnails.findIndex((thumb) => thumb.classList.contains('active')));

        const prevBtn = document.createElement('button');
        const nextBtn = document.createElement('button');
        prevBtn.type = 'button';
        nextBtn.type = 'button';
        prevBtn.className = 'gallery-arrow gallery-arrow-prev';
        nextBtn.className = 'gallery-arrow gallery-arrow-next';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        prevBtn.setAttribute('aria-label', 'Предыдущее фото');
        nextBtn.setAttribute('aria-label', 'Следующее фото');
        galleryContainer.append(prevBtn, nextBtn);

        function showSlide(index) {
            activeSlide = (index + thumbnails.length) % thumbnails.length;
            const selectedThumb = thumbnails[activeSlide];
            changeImage(selectedThumb);
            selectedThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }

        prevBtn.addEventListener('click', () => showSlide(activeSlide - 1));
        nextBtn.addEventListener('click', () => showSlide(activeSlide + 1));

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                activeSlide = index;
            });
        });

        document.addEventListener('keydown', (event) => {
            if (!document.querySelector('.room-page')) return;
            if (event.key === 'ArrowLeft') showSlide(activeSlide - 1);
            if (event.key === 'ArrowRight') showSlide(activeSlide + 1);
        });
    }

    // =========================
    // TOAST УВЕДОМЛЕНИЯ
    // =========================
    function getToastContainer() {
        let container = document.querySelector('.toast-container');

        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        return container;
    }

    function showToast(title, message = '', type = 'success', timeout = 3200) {
        const container = getToastContainer();
        const toast = document.createElement('div');
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-exclamation',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <div>
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
        `;

        container.appendChild(toast);

        const closeToast = () => {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };

        toast.addEventListener('click', closeToast);
        setTimeout(closeToast, timeout);
    }

    // =========================
    // ANIMATIONS ПРИ СКРОЛЛЕ
    // =========================
    const animatedItems = document.querySelectorAll(
        '.room-card, .service-item, .contact-item, .booking-form-card, .checkout-form, .cart-summary, .checkout-summary, .cart-item, .summary-item, .room-gallery-section, .room-info-section'
    );

    animatedItems.forEach((item, index) => {
        item.classList.add('fade-up');
        item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        animatedItems.forEach((item) => observer.observe(item));
    } else {
        animatedItems.forEach((item) => item.classList.add('is-visible'));
    }

    // =========================
    // DATEPICKER + LIVE РАСЧЕТ
    // =========================
    const checkInInput = document.querySelector('.check-in');
    const checkOutInput = document.querySelector('.check-out');
    const liveTotal = document.getElementById('booking-live-total');

    function updateLiveTotal() {
        if (!liveTotal) return;

        const price = getRoomPrice();
        const checkIn = checkInInput?.value || '';
        const checkOut = checkOutInput?.value || '';
        const priceEl = liveTotal.querySelector('.booking-live-price');
        const noteEl = liveTotal.querySelector('.booking-live-note');

        if (!checkIn || !checkOut) {
            priceEl.innerText = 'Выберите даты';
            noteEl.innerText = 'Минимальная стоимость — 1 ночь';
            return;
        }

        const nights = getNightsCount(checkIn, checkOut);
        const total = price * nights;

        priceEl.innerText = `${formatMoney(total)}`;
        noteEl.innerText = `${formatMoney(price)} × ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')}`;
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    if (checkInInput && checkOutInput) {
        if (window.flatpickr) {
            const commonOptions = {
                dateFormat: 'Y-m-d',
                altInput: true,
                altFormat: 'd.m.Y',
                minDate: 'today',
                locale: window.flatpickr.l10ns?.ru || 'ru',
                disableMobile: true
            };

            const checkoutPicker = flatpickr(checkOutInput, {
                ...commonOptions,
                onChange: updateLiveTotal
            });

            flatpickr(checkInInput, {
                ...commonOptions,
                onChange: (selectedDates) => {
                    if (selectedDates[0]) {
                        const minCheckoutDate = addDays(selectedDates[0], 1);
                        checkoutPicker.set('minDate', minCheckoutDate);

                        if (!checkOutInput.value || new Date(checkOutInput.value) <= selectedDates[0]) {
                            checkoutPicker.setDate(minCheckoutDate, true);
                        }
                    }

                    updateLiveTotal();
                }
            });
        } else {
            const today = new Date().toISOString().split('T')[0];
            checkInInput.type = 'date';
            checkOutInput.type = 'date';
            checkInInput.min = today;
            checkOutInput.min = today;
        }

        checkInInput.addEventListener('change', updateLiveTotal);
        checkOutInput.addEventListener('change', updateLiveTotal);
        updateLiveTotal();
    }

    // =========================
    // ДОБАВЛЕНИЕ В КОРЗИНУ
    // =========================
    const addToCartBtn = document.querySelector('.js-add-to-cart');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const title = getRoomTitle();
            const price = getRoomPrice();
            const checkIn = checkInInput?.value || '';
            const checkOut = checkOutInput?.value || '';
            const guests = document.querySelector('.guests-select')?.value || '2';

            if (!checkIn || !checkOut) {
                showToast('Выберите даты', 'Укажите дату заезда и дату выезда.', 'warning');
                return;
            }

            const nights = getNightsCount(checkIn, checkOut);

            const booking = {
                id: Date.now(),
                title,
                price,
                image: getMiniImageByTitle(title),
                checkIn,
                checkOut,
                guests
            };

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(booking);
            localStorage.setItem('cart', JSON.stringify(cart));

            showToast('Номер добавлен в бронь', `${title}: ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')} — ${formatMoney(price * nights)}`);

            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 850);
        });
    }

    // =========================
    // CART.HTML
    // =========================
    const cartContainer =
        document.getElementById('cart-items-container') ||
        document.querySelector('.cart-items');

    const cartTotalElement =
        document.getElementById('total-price') ||
        document.querySelector('.total-price');

    const summaryList = document.getElementById('cart-summary-list');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cartContainer) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <p style="text-align:center; padding: 40px; color: var(--text-muted);">
                    Ваша корзина пуста.<br>
                    <a href="index.html" style="color: var(--primary); display: inline-block; margin-top: 10px;">
                        Перейти к выбору номеров
                    </a>
                </p>
            `;

            if (checkoutBtn) {
                checkoutBtn.style.display = 'none';
            }

            if (summaryList) {
                summaryList.innerHTML = '';
            }

            if (cartTotalElement) {
                cartTotalElement.innerText = '0 ₽';
            }

        } else {
            cartContainer.innerHTML = '';

            let totalPrice = 0;
            let summaryHTML = '';

            cart.forEach((item, index) => {
                const nights = getNightsCount(item.checkIn, item.checkOut);
                const total = item.price * nights;

                totalPrice += total;

                const image = item.image || getMiniImageByTitle(item.title);

                const card = document.createElement('div');
                card.className = 'cart-item fade-up is-visible';

                card.innerHTML = `
                    <div class="cart-item-content">
                        <img src="${image}" alt="${item.title}" class="cart-item-image">

                        <div class="cart-item-info">
                            <div class="cart-item-header">
                                <h3 class="cart-item-title">${item.title}</h3>

                                <button class="cart-item-delete" data-index="${index}" title="Удалить">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>

                            <div class="cart-item-details">
                                <div class="detail-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${formatDate(item.checkIn)} — ${formatDate(item.checkOut)}</span>
                                </div>

                                <div class="detail-item">
                                    <i class="fas fa-user"></i>
                                    <span>${item.guests} ${getNoun(item.guests, 'гость', 'гостя', 'гостей')}</span>
                                </div>

                                <div class="detail-item">
                                    <i class="fas fa-moon"></i>
                                    <span>${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')}</span>
                                </div>
                            </div>

                            <div class="cart-item-price">
                                ${formatMoney(item.price)} × ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')}
                            </div>

                            <div class="cart-item-total">${formatMoney(total)}</div>
                        </div>
                    </div>
                `;

                cartContainer.appendChild(card);

                summaryHTML += `
                    <div class="summary-row">
                        <span class="text-muted">${item.title}</span>
                        <span>${formatMoney(total)}</span>
                    </div>
                `;
            });

            if (summaryList) {
                summaryList.innerHTML = summaryHTML;
            }

            if (cartTotalElement) {
                cartTotalElement.innerText = formatMoney(totalPrice);
            }

            if (checkoutBtn) {
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.pointerEvents = 'auto';
                checkoutBtn.style.display = 'block';
            }
        }

        cartContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.cart-item-delete');

            if (deleteBtn) {
                const index = Number(deleteBtn.getAttribute('data-index'));
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const card = deleteBtn.closest('.cart-item');
                const removedItem = cart[index];

                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));

                if (card) {
                    card.classList.add('is-removing');
                    card.addEventListener('animationend', () => location.reload(), { once: true });
                } else {
                    location.reload();
                }

                showToast('Бронь удалена', removedItem?.title || 'Номер удален из корзины', 'info');
            }
        });
    }

    // =========================
    // CHECKOUT.HTML
    // =========================
    const bookingDetails = document.getElementById('booking-details');
    const checkoutTotalElement = document.getElementById('total-price');
    const checkoutForm = document.getElementById('checkout-form');

    if (bookingDetails && checkoutTotalElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            window.location.href = 'cart.html';
        } else {
            let totalPrice = 0;
            let detailsHTML = '';

            cart.forEach((item) => {
                const nights = getNightsCount(item.checkIn, item.checkOut);
                const total = item.price * nights;

                totalPrice += total;

                detailsHTML += `
                    <div class="summary-item fade-up is-visible">
                        <h4>${item.title}</h4>

                        <div class="summary-item-details">
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>${formatDate(item.checkIn)} — ${formatDate(item.checkOut)}</span>
                            </div>

                            <div class="detail-item">
                                <i class="fas fa-user"></i>
                                <span>${item.guests} ${getNoun(item.guests, 'гость', 'гостя', 'гостей')}</span>
                            </div>

                            <div class="summary-item-price">
                                ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')} × ${formatMoney(item.price)} = <strong>${formatMoney(total)}</strong>
                            </div>
                        </div>
                    </div>
                `;
            });

            bookingDetails.innerHTML = detailsHTML;
            checkoutTotalElement.innerText = formatMoney(totalPrice);
        }
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname')?.value.trim();
            const passport = document.getElementById('passport')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const email = document.getElementById('email')?.value.trim();

            if (!fullname || !passport || !phone || !email) {
                showToast('Заполните форму', 'Все поля с информацией о госте обязательны.', 'warning');
                return;
            }

            showToast('Бронирование оформлено', 'Мы свяжемся с вами в ближайшее время.', 'success');

            localStorage.removeItem('cart');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        });
    }
});
