// Файл: js/services.js (ПОЛНАЯ ЗАМЕНА)

import { cart } from './cart.js';
import { tg } from './telegram.js';

const UNIQUE_HIGHLIGHT_COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
    '#E91E63', '#00BCD4', '#FF5722', '#8BC34A',
    '#673AB7', '#03A9F4', '#FFEB3B', '#795548'
];

let colorIndex = 0;
function getNextHighlightColor() {
    const color = UNIQUE_HIGHLIGHT_COLORS[colorIndex % UNIQUE_HIGHLIGHT_COLORS.length];
    colorIndex++;
    return color;
}

export const services = {
    maintenance: [
        // === ИЗМЕНЕНО НАЗВАНИЕ УСЛУГИ ===
        { id: 'm1', title: 'Замена масла', price: 1200, description: 'Полная замена масла и масляного фильтра.', icon: 'droplet', highlightColor: getNextHighlightColor() },
        // ===============================
        { id: 'm2', title: 'Замена фильтров', price: 800, description: 'Замена воздушного, салонного и топливного фильтров.', icon: 'filter', highlightColor: getNextHighlightColor() },
        { id: 'm3', title: 'Диагностика подвески', price: 1500, description: 'Полная диагностика подвески.', icon: 'activity', highlightColor: getNextHighlightColor() },
        { id: 'm4', title: 'Замена тормозных колодок', price: 2000, description: 'Замена передних и задних колодок.', icon: 'shield', highlightColor: getNextHighlightColor() }
    ],
    electrical: [
        { id: 'e1', title: 'Ремонт стартера', price: 2500, description: 'Диагностика и ремонт стартера.', icon: 'power', highlightColor: getNextHighlightColor() },
        { id: 'e2', title: 'Ремонт генератора', price: 3000, description: 'Диагностика и ремонт генератора.', icon: 'battery-charging', highlightColor: getNextHighlightColor() },
        { id: 'e3', title: 'Диагностика электросистемы', price: 1700, description: 'Полная диагностика электрической системы.', icon: 'zap', highlightColor: getNextHighlightColor() },
        { id: 'e4', title: 'Установка сигнализации', price: 5000, description: 'Установка и настройка сигнализации.', icon: 'bell', highlightColor: getNextHighlightColor() }
    ]
};

export function applyCardHighlight(element, color) {
    if (!element || !color) return;
    element.style.borderColor = color;
    element.style.boxShadow = `0 0 10px 1px ${color}`;
}

export function removeCardHighlight(element) {
    if (!element) return;
    element.style.borderColor = '';
    element.style.boxShadow = '';
}

export function createServiceCard(service, addToCartCallback) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.serviceId = service.id;

    const isInCart = cart.some(item => item.id === service.id);

    if (isInCart) {
        card.classList.add('selected-in-cart');
        applyCardHighlight(card, service.highlightColor);
    }

    card.addEventListener('mouseenter', () => {
        applyCardHighlight(card, service.highlightColor);
    });

    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('selected-in-cart')) {
            removeCardHighlight(card);
        }
    });

    card.innerHTML = `
        <div class="service-icon"><i data-feather="${service.icon}"></i></div>
        <div class="service-info">
            <div class="service-title">${service.title}</div>
            <div class="service-price">${service.price} ₽</div>
            <div class="service-description">${service.description}</div>
            <button class="add-button" data-id="${service.id}">
                ${isInCart ? '<i data-feather="check"></i> В корзине' : '<i data-feather="plus"></i> Добавить'}
            </button>
        </div>`;
    
    const addButton = card.querySelector('.add-button');
    if (isInCart) {
        addButton.disabled = true;
    }

    addButton.addEventListener('click', e => {
        e.stopPropagation();
        addToCartCallback(service);
    });
    
    return card;
}

export function renderServices(containerId, serviceList, addToCartCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }
    container.innerHTML = ''; 
    // Важно сбрасывать colorIndex перед рендерингом каждой категории, если вы хотите,
    // чтобы цвета не продолжались с предыдущей категории, а начинались заново из палитры
    // или были более предсказуемыми для каждой категории.
    // Если вы хотите абсолютно уникальные цвета для всех услуг подряд, закомментируйте строку ниже.
    colorIndex = 0; 

    serviceList.forEach(service => {
        const card = createServiceCard(service, addToCartCallback);
        container.appendChild(card);
    });
    
    if (typeof feather !== 'undefined') {
        feather.replace(); 
    }
}
