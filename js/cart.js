// Файл: js/cart.js (ПОЛНАЯ ЗАМЕНА)

import { tg } from './telegram.js';
import { applyCardHighlight, removeCardHighlight } from './services.js';

export let cart = []; // Теперь корзина может содержать максимум 1 элемент

function findServiceCardElement(serviceId) {
    return document.querySelector(`.service-card[data-service-id="${serviceId}"]`);
}

export function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    // Т.к. в корзине максимум 1 товар с количеством 1, значок будет либо 0, либо 1
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
    
    // Если мы здесь, значит в корзине есть 1 товар
    if (submitCartButton) submitCartButton.disabled = false;
    const item = cart[0]; // Берем единственный товар

    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.innerHTML = `
        <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div> {/* Количество всегда 1 */}
            <div class="cart-item-price">${item.price} ₽</div> {/* Цена за 1 единицу */}
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
            <i data-feather="trash-2"></i>
        </button>`;
    cartItemDiv.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
    cartItemsEl.appendChild(cartItemDiv);

    cartTotalEl.textContent = `${item.price} ₽`; // Общая сумма равна цене единственного товара

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
            if (tg && tg.showAlert) tg.showAlert("В корзину можно добавить только одну услугу. Пожалуйста, сначала удалите текущую выбранную услугу.");
        }
        return; // Не добавляем ничего, если корзина не пуста
    }

    // Если корзина пуста, добавляем услугу
    // quantity всегда 1, highlightColor берется из service
    cart.push({ ...service, quantity: 1 }); 
    
    const cardElement = findServiceCardElement(service.id);
    if (cardElement) {
        cardElement.classList.add('selected-in-cart');
        applyCardHighlight(cardElement, service.highlightColor);
    }
    
    // Фидбек на кнопке "Добавить" (временный)
    const addButton = document.querySelector(`.add-button[data-id="${service.id}"]`);
    if (addButton) {
        const originalButtonHTML = addButton.innerHTML;
        addButton.innerHTML = '<i data-feather="check"></i> Добавлено';
        addButton.disabled = true; // Делаем кнопку неактивной после добавления
        if (typeof feather !== 'undefined') feather.replace();
        
        // Не будем возвращать текст кнопки, пусть остается "Добавлено" и неактивной
        // setTimeout(() => {
        //     addButton.innerHTML = originalButtonHTML;
        //     if (typeof feather !== 'undefined') feather.replace();
        // }, 1500); 
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

    cart = []; // Просто очищаем корзину, т.к. там мог быть только один товар

    const cardElement = findServiceCardElement(serviceId);
    if (cardElement) {
        cardElement.classList.remove('selected-in-cart');
        removeCardHighlight(cardElement);
        // Восстанавливаем кнопку "Добавить"
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
        const itemInCart = cart[0]; // Был только один элемент
        const cardElement = findServiceCardElement(itemInCart.id);
        if (cardElement) {
            cardElement.classList.remove('selected-in-cart');
            removeCardHighlight(cardElement);
            // Восстанавливаем кнопку "Добавить"
            const addButton = cardElement.querySelector(`.add-button[data-id="${itemInCart.id}"]`);
            if (addButton) {
                addButton.innerHTML = '<i data-feather="plus"></i> Добавить';
                addButton.disabled = false;
                if (typeof feather !== 'undefined') feather.replace();
            }
        }
    }

    cart = [];
    updateCartBadge();
    renderCart();
    
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    if (cartPanel) cartPanel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
}

// В showSuccessMessage теперь нужно получить данные о заказанной услуге ПЕРЕД очисткой корзины
export function showSuccessMessage(orderedItemTitle) { // Принимаем название заказанной услуги
    const successMessageEl = document.getElementById('successMessage');
    const successDetailsEl = document.getElementById('successDetailsText'); // Нужен ID для <p>
    const overlayEl = document.getElementById('overlay');

    if (successDetailsEl && orderedItemTitle) {
        successDetailsEl.textContent = `Вы записаны на "${orderedItemTitle}". Менеджер перезвонит вам с номера, окончание 0911.`;
    } else if (successDetailsEl) {
        successDetailsEl.textContent = `Ваша заявка принята. Менеджер перезвонит вам с номера, окончание 0911.`;
    }

    if (successMessageEl) successMessageEl.classList.add('visible');
    if (overlayEl) overlayEl.classList.add('visible');
    
    clearCart(); 
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) cartPanel.classList.remove('visible');
}
