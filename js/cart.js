// Файл: js/cart.js (ПОЛНАЯ ЗАМЕНА)

import { tg } from './telegram.js';
// Импортируем функции для управления подсветкой из services.js
import { applyHighlightStyle, removeHighlightStyle } from './services.js';

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
    
    const submitCartButton = document.getElementById('submitCart'); // Получаем кнопку здесь

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="text-align: center; opacity: 0.7;">Корзина пуста</p>';
        cartTotalEl.textContent = '0 ₽';
        if (submitCartButton) submitCartButton.disabled = true; // Деактивируем кнопку если корзина пуста
        return;
    }
    if (submitCartButton) submitCartButton.disabled = false; // Активируем, если есть товары

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

export function addToCart(service) { // service теперь полный объект, включая highlightColor
    if (!service || typeof service.id === 'undefined' || !service.highlightColor) {
        console.error("Попытка добавить невалидный сервис или сервис без highlightColor:", service);
        if (tg && tg.showAlert) tg.showAlert("Ошибка: Некорректные данные об услуге.");
        return;
    }
    
    const existingItem = cart.find(item => item.id === service.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Добавляем новый товар с его цветом подсветки
        cart.push({ ...service, quantity: 1 }); 
        const cardElement = findServiceCardElement(service.id);
        if (cardElement) {
            applyHighlightStyle(cardElement, service.highlightColor);
        }
    }

    // Фидбек на кнопке "Добавить"
    const button = document.querySelector(`.add-button[data-id="${service.id}"]`);
    if (button) {
        const originalButtonHTML = button.innerHTML; 
        button.innerHTML = '<i data-feather="check"></i> Добавлено';
        if (typeof feather !== 'undefined') feather.replace();
        
        setTimeout(() => {
            button.innerHTML = originalButtonHTML; 
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

    // Предполагаем полное удаление, как и раньше. Если будет логика количества,
    // то removeHighlightStyle нужно вызывать только при quantity === 0.
    cart = cart.filter(item => item.id !== serviceId);

    const cardElement = findServiceCardElement(serviceId);
    if (cardElement) {
         // Убедимся, что товара действительно нет в корзине перед снятием подсветки
        if (!cart.some(item => item.id === serviceId)) {
            removeHighlightStyle(cardElement);
        }
    }
    
    updateCartBadge();
    renderCart();
}

export function clearCart() {
    cart.forEach(itemInCart => {
        const cardElement = findServiceCardElement(itemInCart.id);
        if (cardElement) {
            removeHighlightStyle(cardElement);
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
    
    clearCart(); // clearCart теперь сам убирает подсветку
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}
