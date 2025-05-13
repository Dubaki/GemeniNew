// Файл: js/services.js (ПОЛНАЯ ЗАМЕНА)

import { cart } from './cart.js'; // Для проверки, есть ли услуга в корзине

// Примерные цвета для подсветки. Подберите свои!
const HIGHLIGHT_COLORS = {
    maintenance_default: '#FF9800', // Оранжевый для ТО
    electrical_default: '#2196F3',   // Синий для электрики
    // Можно задать уникальные цвета для каждого ID, если нужно больше разнообразия
    m1_color: '#4CAF50', // Зеленый для замены масла
    e1_color: '#F44336', // Красный для ремонта стартера
};

export const services = {
    maintenance: [
        { id: 'm1', title: 'Замена масла (НОВЫЙ ДИЗАЙН)', price: 1200, description: 'Полная замена масла и масляного фильтра.', icon: 'droplet', highlightColor: HIGHLIGHT_COLORS.m1_color },
        { id: 'm2', title: 'Замена фильтров', price: 800, description: 'Замена воздушного, салонного и топливного фильтров.', icon: 'filter', highlightColor: HIGHLIGHT_COLORS.maintenance_default },
        { id: 'm3', title: 'Диагностика подвески', price: 1500, description: 'Полная диагностика подвески.', icon: 'activity', highlightColor: HIGHLIGHT_COLORS.maintenance_default },
        { id: 'm4', title: 'Замена тормозных колодок', price: 2000, description: 'Замена передних и задних колодок.', icon: 'shield', highlightColor: HIGHLIGHT_COLORS.maintenance_default }
    ],
    electrical: [
        { id: 'e1', title: 'Ремонт стартера', price: 2500, description: 'Диагностика и ремонт стартера.', icon: 'power', highlightColor: HIGHLIGHT_COLORS.e1_color },
        { id: 'e2', title: 'Ремонт генератора', price: 3000, description: 'Диагностика и ремонт генератора.', icon: 'battery-charging', highlightColor: HIGHLIGHT_COLORS.electrical_default },
        { id: 'e3', title: 'Диагностика электросистемы', price: 1700, description: 'Полная диагностика электрической системы.', icon: 'zap', highlightColor: HIGHLIGHT_COLORS.electrical_default },
        { id: 'e4', title: 'Установка сигнализации', price: 5000, description: 'Установка и настройка сигнализации.', icon: 'bell', highlightColor: HIGHLIGHT_COLORS.electrical_default }
    ]
};

// Функция для применения стилей подсветки
function applyHighlightStyle(element, color) {
    element.style.borderColor = color;
    element.style.boxShadow = `0 0 10px 2px ${color}`; // Тень того же цвета
    element.classList.add('selected'); // Добавляем класс-маркер
}

// Функция для снятия стилей подсветки
function removeHighlightStyle(element) {
    element.style.borderColor = ''; // Сбрасываем на значение из CSS или родителя
    element.style.boxShadow = '';   // Сбрасываем тень
    element.classList.remove('selected'); // Удаляем класс-маркер
}


export function createServiceCard(service, addToCartCallback) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.serviceId = service.id; // Для легкого доступа к элементу

    // Проверяем, есть ли товар в корзине, и применяем подсветку при необходимости
    if (cart.some(item => item.id === service.id)) {
        applyHighlightStyle(card, service.highlightColor || HIGHLIGHT_COLORS.maintenance_default); // Фоллбэк на дефолтный цвет
    }

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
    
    // Кнопке "Добавить" передаем весь объект service, чтобы иметь доступ к highlightColor в addToCart
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
    
    serviceList.forEach(service => {
        const card = createServiceCard(service, addToCartCallback);
        container.appendChild(card);
    });
    
    if (typeof feather !== 'undefined') {
        feather.replace(); 
    }
}

// Экспортируем функции управления стилями, чтобы их можно было использовать в cart.js
export { applyHighlightStyle, removeHighlightStyle };
