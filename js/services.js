// Файл: js/services.js (ПОЛНАЯ ЗАМЕНА)

import { cart } from './cart.js'; // Для проверки, есть ли услуга в корзине

// Палитра уникальных цветов для подсветки. Добавьте/измените по вкусу.
// Нужно как минимум 8 для ваших текущих услуг.
const UNIQUE_HIGHLIGHT_COLORS = [
    '#4CAF50', // Зеленый
    '#2196F3', // Синий
    '#FF9800', // Оранжевый
    '#9C27B0', // Фиолетовый
    '#E91E63', // Розовый
    '#00BCD4', // Бирюзовый
    '#FF5722', // Глубокий оранжевый
    '#8BC34A', // Светло-зеленый
    '#673AB7', // Глубокий фиолетовый
    '#03A9F4', // Голубой
];

// Присваиваем цвета услугам. Если услуг больше, чем цветов, они начнут повторяться (или добавьте больше цветов).
let colorIndex = 0;
function getNextHighlightColor() {
    const color = UNIQUE_HIGHLIGHT_COLORS[colorIndex % UNIQUE_HIGHLIGHT_COLORS.length];
    colorIndex++;
    return color;
}

export const services = {
    maintenance: [
        { id: 'm1', title: 'Замена масла (НОВЫЙ ДИЗАЙН)', price: 1200, description: 'Полная замена масла и масляного фильтра.', icon: 'droplet', highlightColor: getNextHighlightColor() },
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

// Функция для применения стилей подсветки (устанавливает inline-стили)
export function applyCardHighlight(element, color) {
    if (!element || !color) return;
    element.style.borderColor = color;
    element.style.boxShadow = `0 0 10px 1px ${color}`; // Тень того же цвета
}

// Функция для снятия стилей подсветки (сбрасывает inline-стили)
export function removeCardHighlight(element) {
    if (!element) return;
    element.style.borderColor = ''; // Вернет к значению из CSS (transparent)
    element.style.boxShadow = '';   // Уберет тень
}

export function createServiceCard(service, addToCartCallback) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.serviceId = service.id;

    // Если товар уже в корзине при начальной отрисовке, подсвечиваем его и добавляем класс
    if (cart.some(item => item.id === service.id)) {
        card.classList.add('selected-in-cart'); // Маркер, что товар в корзине
        applyCardHighlight(card, service.highlightColor);
    }

    card.addEventListener('mouseenter', () => {
        applyCardHighlight(card, service.highlightColor);
    });

    card.addEventListener('mouseleave', () => {
        // Убираем подсветку при уходе мыши ТОЛЬКО ЕСЛИ товар не в корзине
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
                <i data-feather="plus"></i> Добавить
            </button>
        </div>`;
    
    card.querySelector('.add-button').addEventListener('click', e => {
        e.stopPropagation();
        addToCartCallback(service); // Передаем весь объект service
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
    
    // Сбрасываем colorIndex для каждой категории, чтобы цвета были разнообразнее, если категории рендерятся отдельно
    // Если все услуги рендерятся одним вызовом, это не нужно.
    // Для нашего случая (две категории рендерятся последовательно) это даст более разнообразные цвета.
    colorIndex = 0;

    serviceList.forEach(service => {
        const card = createServiceCard(service, addToCartCallback);
        container.appendChild(card);
    });
    
    if (typeof feather !== 'undefined') {
        feather.replace(); 
    }
}
