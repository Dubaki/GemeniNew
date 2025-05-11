// Файл: GemeniNew/js/services.js
export const services = {
    maintenance: [
        // ВАЖНО: Замените эти тестовые данные на ваши реальные услуги!
        // Используйте имена иконок с сайта feathericons.com
        { id: 'm1', title: 'Замена масла (НОВЫЙ ДИЗАЙН)', price: 1200, description: 'Полная замена масла и масляного фильтра.', icon: 'droplet' },
        { id: 'm2', title: 'Замена фильтров', price: 800, description: 'Замена воздушного, салонного и топливного фильтров.', icon: 'filter' },
        { id: 'm3', title: 'Диагностика подвески', price: 1500, description: 'Полная диагностика подвески.', icon: 'activity' },
        { id: 'm4', title: 'Замена тормозных колодок', price: 2000, description: 'Замена передних и задних колодок.', icon: 'shield' }
    ],
    electrical: [
        { id: 'e1', title: 'Ремонт стартера', price: 2500, description: 'Диагностика и ремонт стартера.', icon: 'power' },
        { id: 'e2', title: 'Ремонт генератора', price: 3000, description: 'Диагностика и ремонт генератора.', icon: 'battery-charging' },
        { id: 'e3', title: 'Диагностика электросистемы', price: 1700, description: 'Полная диагностика электрической системы.', icon: 'zap' },
        { id: 'e4', title: 'Установка сигнализации', price: 5000, description: 'Установка и настройка сигнализации.', icon: 'bell' }
    ]
};

export function createServiceCard(service, addToCartCallback) {
    const card = document.createElement('div');
    card.className = 'service-card';
    // === ИСПРАВЛЕНО ЗДЕСЬ ===
    card.innerHTML = `
        <div class="service-icon"><i data-feather="${service.icon}"></i></div>
        <div class="service-info">
            <div class="service-title">${service.title}</div>
            <div class="service-price">${service.price} ₽</div>
            <div class="service-description">${service.description}</div>
            <button class="add-button" data-id="${service.id}" data-title="${service.title}" data-price="${service.price}">
                <i data-feather="plus"></i> Добавить
            </button>
        </div>`;
    // =======================
    
    card.querySelector('.add-button').addEventListener('click', e => {
        e.stopPropagation();
        addToCartCallback({
            id: service.id,
            title: service.title,
            price: service.price,
        });
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