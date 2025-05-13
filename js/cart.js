// Файл: js/cart.js (ПОЛНАЯ ЗАМЕНА)

import { tg } from './telegram.js';
import { applyCardHighlight, removeCardHighlight } from './services.js'; // Импорт функций управления подсветкой

export let cart = [];

function findServiceCardElement(serviceId) {
    return document.querySelector(`.service-card[data-service-id="${serviceId}"]`);
}

export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    badge.textContent = totalQuantity;
    badge.style.display = totalQuantity > 0 ? 'flex' : 'none';
}

export function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = '';
    const submitCartButton = document.getElementById('submitCart');

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="text-align: center; opacity: 0.7;">Корзина пуста</p>';
        cartTotalEl.textContent = '0 ₽';
        if (submitCartButton) submitCartButton.disabled = true;
        return;
    }
    if (submitCartButton) submitCartButton.disabled = false;

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title} x${item.quantity}</div>
                <div class="cart-item-price">${item.price * item.quantity} ₽</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i data-feather="trash-2"></i>
            </button>`;
        cartItemDiv.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
        cartItemsEl.appendChild(cartItemDiv);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `${total} ₽`;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

export function addToCart(service) { // service - полный объект, включая highlightColor
    if (!service || typeof service.id === 'undefined' || !service.highlightColor) {
        console.error("Попытка добавить невалидный сервис или сервис без highlightColor:", service);
        if (tg && tg.showAlert) tg.showAlert("Ошибка: Некорректные данные об услуге.");
        return;
    }

    const existingItem = cart.find(item => item.id === service.id);
    const cardElement = findServiceCardElement(service.id); // Находим карточку

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...service, quantity: 1 });
        if (cardElement) {
            cardElement.classList.add('selected-in-cart'); // Добавляем маркер "в корзине"
            // Подсветка уже должна была примениться по mouseenter,
            // но если мышь ушла быстро, или для уверенности:
            applyCardHighlight(cardElement, service.highlightColor);
        }
    }
    
    // Обновляем кнопку "Добавить" (текст и иконка)
    const addButton = document.querySelector(`.add-button[data-id="${service.id}"]`);
    if (addButton) {
        const originalButtonHTML = addButton.innerHTML;
        addButton.innerHTML = '<i data-feather="check"></i> Добавлено';
        if (typeof feather !== 'undefined') feather.replace();
        setTimeout(() => {
            addButton.innerHTML = originalButtonHTML;
            if (typeof feather !== 'undefined') feather.replace();
        }, 1500);
    }

    if (tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    updateCartBadge();
    renderCart();
}

export function removeFromCart(serviceId) {
    const itemIndex = cart.findIndex(item => item.id === serviceId);
    if (itemIndex === -1) return;

    // Предполагается полное удаление товара из корзины
    const removedItem = cart[itemIndex]; // Сохраняем информацию об удаляемом товаре
    cart = cart.filter(item => item.id !== serviceId);

    const cardElement = findServiceCardElement(serviceId);
    if (cardElement) {
        cardElement.classList.remove('selected-in-cart'); // Убираем маркер "в корзине"
        // Если мышь не над элементом, убираем подсветку.
        // Это может быть сложно отследить, проще убрать всегда,
        // а mouseenter, если мышь осталась, снова ее применит.
        // Или, если мышь не наведена, подсветка должна уйти.
        // Лучше всего положиться на mouseleave в services.js, он сам проверит selected-in-cart.
        // Просто удалим подсветку, если курсор не наведен (проверить, не активен ли hover)
        // Это сложно, поэтому просто вызовем removeCardHighlight. Если мышь еще наведена,
        // то mouseenter ее снова применит. Если нет, то она пропадет, как и нужно.
        // Однако, если mouseleave проверяет 'selected-in-cart', то он не уберет подсветку, если класс еще есть.
        // Поэтому, сначала удаляем класс, потом смотрим, что делать с подсветкой.
        
        // Если элемент больше не выделен (т.е. не под курсором И не в корзине), убираем подсветку
        // Простой вариант: всегда убирать. Если курсор все еще на элементе, mouseenter её вернет.
        removeCardHighlight(cardElement);
    }

    updateCartBadge();
    renderCart();
}

export function clearCart() {
    cart.forEach(itemInCart => {
        const cardElement = findServiceCardElement(itemInCart.id);
        if (cardElement) {
            cardElement.classList.remove('selected-in-cart');
            removeCardHighlight(cardElement); // Убираем подсветку со всех
        }
    });

    cart = [];
    updateCartBadge();
    renderCart();

    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (cartPanel) cartPanel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
}

export function showSuccessMessage() {
    const successMessageEl = document.getElementById('successMessage');
    const overlayEl = document.getElementById('overlay');
    if (successMessageEl) successMessageEl.classList.add('visible');
    if (overlayEl) overlayEl.classList.add('visible');
    
    clearCart(); // clearCart теперь корректно снимает подсветку
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}
