// Файл: js/cart.js (ПОЛНАЯ ЗАМЕНА с localStorage)

import { tg } from './telegram.js';
import { applyCardHighlight, removeCardHighlight } from './services.js';

const CART_STORAGE_KEY = 'miniAppElmexCart';

// Загружаем корзину при инициализации модуля
let cart = loadCartFromLocalStorageInternal();

// Внутренняя функция загрузки
function loadCartFromLocalStorageInternal() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Убедимся, что это массив и содержит не более одного элемента
            if (Array.isArray(parsedCart) && parsedCart.length <= 1) {
                return parsedCart;
            }
        }
    } catch (e) {
        console.error("Error loading cart from localStorage:", e);
    }
    return []; // Возвращаем пустую корзину по умолчанию или при ошибке
}

// Функция сохранения
function saveCartToLocalStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Error saving cart to localStorage:", e);
    }
}

// Экспортируемая функция для вызова из app.js, если нужно (например, для инициализации значка)
export function initializeCart() {
    cart = loadCartFromLocalStorageInternal(); // Убедимся, что cart актуален
    updateCartBadge();
    // renderCart() не вызываем здесь, он вызывается при открытии панели
}


function findServiceCardElement(serviceId) {
    return document.querySelector(`.service-card[data-service-id="${serviceId}"]`);
}

export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const totalQuantity = cart.length > 0 ? 1 : 0;
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
    const item = cart[0]; 

    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
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

    cartTotalEl.textContent = `${item.price} ₽`;

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

export function addToCart(service) {
    if (!service || typeof service.id === 'undefined' || !service.highlightColor) {
        console.error("Попытка добавить невалидный сервис или сервис без highlightColor:", service);
        if (tg && tg.showAlert) tg.showAlert("Ошибка: Некорректные данные об услуге.");
        return;
    }

    if (cart.length > 0) {
        if (cart[0].id === service.id) {
            if (tg && tg.showAlert) tg.showAlert("Эта услуга уже в корзине.");
        } else {
            if (tg && tg.showAlert) tg.showAlert("В корзину можно добавить только одну услугу. Очистите корзину, чтобы выбрать другую.");
        }
        return; 
    }

    cart.push({ ...service, quantity: 1 });
    saveCartToLocalStorage(); // Сохраняем
    
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

    cart = []; // Очищаем, так как там был один элемент
    saveCartToLocalStorage(); // Сохраняем

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
    if (cart.length > 0) {
        const itemInCart = cart[0];
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
    }

    cart = [];
    saveCartToLocalStorage(); // Сохраняем
    updateCartBadge();
    renderCart();
    
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (cartPanel) cartPanel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
}

export function showSuccessMessage(orderedItemTitle) {
    const successMessageEl = document.getElementById('successMessage');
    const successDetailsEl = document.getElementById('successDetailsText');
    const overlayEl = document.getElementById('overlay');

    if (successDetailsEl && orderedItemTitle) {
        successDetailsEl.textContent = `Вы записаны на "${orderedItemTitle}". Менеджер перезвонит вам с номера, окончание 0911.`;
    } else if (successDetailsEl) {
        successDetailsEl.textContent = `Ваша заявка принята. Менеджер перезвонит вам с номера, окончание 0911.`;
    }

    if (successMessageEl) successMessageEl.classList.add('visible');
    if (overlayEl) overlayEl.classList.add('visible');
    
    // Очищаем корзину (и localStorage внутри clearCart)
    clearCart(); 
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}
