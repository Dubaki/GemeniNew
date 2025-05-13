// Файл: js/cart.js (ПОЛНАЯ ЗАМЕНА)

import { tg } from './telegram.js';
import { applyCardHighlight, removeCardHighlight } from './services.js';

const CART_STORAGE_KEY = 'miniAppElmexCart';

function loadCartFromLocalStorageInternal() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Убедимся, что это массив
            if (Array.isArray(parsedCart)) {
                // Убедимся, что каждый элемент имеет id (базовая проверка)
                return parsedCart.filter(item => item && typeof item.id !== 'undefined');
            }
        }
    } catch (e) {
        console.error("Error loading cart from localStorage:", e);
    }
    return [];
}

export let cart = loadCartFromLocalStorageInternal();

function saveCartToLocalStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Error saving cart to localStorage:", e);
    }
}

export function initializeCart() {
    cart = loadCartFromLocalStorageInternal();
    updateCartBadge();
}

function findServiceCardElement(serviceId) {
    return document.querySelector(`.service-card[data-service-id="${serviceId}"]`);
}

export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = cart.length; // Количество уникальных услуг
    badge.style.display = cart.length > 0 ? 'flex' : 'none';
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
    
    let currentTotal = 0;
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        // Количество всегда 1, так что не отображаем его явно в корзине, только название и цену
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price} ₽</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i data-feather="trash-2"></i>
            </button>`;
        cartItemDiv.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
        cartItemsEl.appendChild(cartItemDiv);
        currentTotal += item.price; // Суммируем цены всех уникальных услуг
    });

    cartTotalEl.textContent = `${currentTotal} ₽`;

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

    // Проверяем, есть ли уже такая услуга в корзине
    const existingItemIndex = cart.findIndex(item => item.id === service.id);

    if (existingItemIndex !== -1) {
        if (tg && tg.showAlert) tg.showAlert("Эта услуга уже добавлена в корзину.");
        return; // Услуга уже есть, ничего не делаем
    }

    // Добавляем новую услугу (количество по умолчанию 1)
    cart.push({ ...service, quantity: 1 }); // quantity здесь для совместимости с orderDetails, всегда 1
    saveCartToLocalStorage();
    
    const cardElement = findServiceCardElement(service.id);
    if (cardElement) {
        cardElement.classList.add('selected-in-cart');
        applyCardHighlight(cardElement, service.highlightColor);
        const addButton = cardElement.querySelector('.add-button');
        if (addButton) {
            addButton.innerHTML = '<i data-feather="check"></i> В корзине';
            addButton.disabled = true;
            if (typeof feather !== 'undefined') feather.replace();
        }
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

    cart.splice(itemIndex, 1); // Удаляем услугу из массива
    saveCartToLocalStorage();

    const cardElement = findServiceCardElement(serviceId);
    if (cardElement) {
        cardElement.classList.remove('selected-in-cart');
        removeCardHighlight(cardElement);
        const addButton = cardElement.querySelector(`.add-button[data-id="${serviceId}"]`);
        if (addButton) {
            addButton.innerHTML = '<i data-feather="plus"></i> Добавить';
            addButton.disabled = false;
            if (typeof feather !== 'undefined') feather.replace();
        }
    }
    
    updateCartBadge();
    renderCart();
}

export function clearCart() {
    cart.forEach(itemInCart => {
        const cardElement = findServiceCardElement(itemInCart.id);
        if (cardElement) {
            cardElement.classList.remove('selected-in-cart');
            removeCardHighlight(cardElement);
            const addButton = cardElement.querySelector(`.add-button[data-id="${itemInCart.id}"]`);
            if (addButton) {
                addButton.innerHTML = '<i data-feather="plus"></i> Добавить';
                addButton.disabled = false;
                if (typeof feather !== 'undefined') feather.replace();
            }
        }
    });

    cart = [];
    saveCartToLocalStorage();
    updateCartBadge();
    renderCart();
    
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (cartPanel) cartPanel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
}

// showSuccessMessage теперь не принимает аргументов, текст задан в HTML
export function showSuccessMessage() {
    const successMessageEl = document.getElementById('successMessage');
    const overlayEl = document.getElementById('overlay');
    // Текст сообщения теперь напрямую в HTML

    if (successMessageEl) successMessageEl.classList.add('visible');
    if (overlayEl) overlayEl.classList.add('visible');
    
    clearCart(); 
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}
