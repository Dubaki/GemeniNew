// Файл: GemeniNew/js/cart.js

// Импортируем tg из telegram.js для доступа к HapticFeedback и showAlert
import { tg } from './telegram.js';

export let cart = []; // Массив для хранения товаров в корзине

// Функция для обновления значка корзины
export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    badge.textContent = totalQuantity;
    badge.style.display = totalQuantity > 0 ? 'flex' : 'none';
}

// Функция для отрисовки товаров в панели корзины
export function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = ''; // Очищаем текущие элементы
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="text-align: center; opacity: 0.7;">Корзина пуста</p>';
        cartTotalEl.textContent = '0 ₽';
        return;
    }

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        // === ИСПРАВЛЕНО ЗДЕСЬ ===
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title} x${item.quantity}</div>
                <div class="cart-item-price">${item.price * item.quantity} ₽</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i data-feather="trash-2"></i>
            </button>`;
        // =======================
        
        cartItemDiv.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
        cartItemsEl.appendChild(cartItemDiv);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `${total} ₽`;
    
    if (typeof feather !== 'undefined') {
        feather.replace(); // Обновляем иконки удаления
    }
}

// Функция добавления товара в корзину
export function addToCart(service) { // service - это объект {id, title, price}
    if (!service || typeof service.id === 'undefined' || typeof service.title === 'undefined' || typeof service.price === 'undefined') {
        console.error("Попытка добавить невалидный сервис в корзину:", service);
        if (tg && tg.showAlert) tg.showAlert("Ошибка: Некорректные данные об услуге.");
        return;
    }
    
    const existingItem = cart.find(item => item.id === service.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...service, quantity: 1 });
    }

    // Визуальный фидбек на кнопке "Добавить"
    const button = document.querySelector(`.add-button[data-id="${service.id}"]`);
    if (button) {
        const originalButtonColor = button.style.backgroundColor; 
        const originalButtonHTML = button.innerHTML; 

        button.style.backgroundColor = '#22c55e'; // Зеленый цвет
        button.innerHTML = '<i data-feather="check"></i> Добавлено';
        if (typeof feather !== 'undefined') feather.replace();
        
        setTimeout(() => {
            button.style.backgroundColor = originalButtonColor; 
            button.innerHTML = originalButtonHTML; 
            if (typeof feather !== 'undefined') feather.replace();
        }, 1500); 
    }
    
    if (tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred) {
         tg.HapticFeedback.notificationOccurred('success');
    }

    updateCartBadge();
    renderCart(); // Перерисовываем корзину при добавлении, если она открыта
}

// Функция удаления товара из корзины
export function removeFromCart(serviceId) {
    cart = cart.filter(item => item.id !== serviceId);
    updateCartBadge();
    renderCart(); // Важно перерисовать корзину
}

// Функция очистки корзины
export function clearCart() {
    cart = [];
    updateCartBadge();
    renderCart();
    // Закрываем панель корзины после очистки
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (cartPanel) cartPanel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
}

// Функция для отображения сообщения об успехе
export function showSuccessMessage() {
    const successMessageEl = document.getElementById('successMessage');
    const overlayEl = document.getElementById('overlay');
    if (successMessageEl) successMessageEl.classList.add('visible');
    if (overlayEl) overlayEl.classList.add('visible');
    
    clearCart(); 
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}