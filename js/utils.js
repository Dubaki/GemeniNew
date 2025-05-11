// Файл: GemeniNew/js/utils.js
// Импорты для renderCart и clearCart будут добавлены позже, когда мы заполним cart.js
// import { renderCart, clearCart } from './cart.js'; 

export function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            button.classList.add('active');
            const targetTabId = button.getAttribute('data-tab');
            const targetTabContent = document.getElementById(targetTabId);
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            }
        });
    });
}

export function initAddressButton() {
    const addressBtn = document.getElementById('addressBtn');
    if (addressBtn) {
        addressBtn.addEventListener('click', () => {
            try {
                // Пытаемся использовать Telegram API для открытия ссылки, если доступно
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
                    window.Telegram.WebApp.openLink(`https://yandex.ru/maps/?pt=60.531008,56.820962&z=17&l=map`);
                } else {
                    // Фоллбэк: открываем в новой вкладке, если API Telegram недоступно
                    window.open(`https://yandex.ru/maps/?pt=60.531008,56.820962&z=17&l=map`, '_blank');
                }
            } catch (error) {
                console.error('Не удалось открыть карту:', error);
                // Фоллбэк на случай любой ошибки
                alert('Координаты: 56.820962, 60.531008 (г. Екатеринбург, ул. Линейная 27)');
            }
        });
    }
}

export function initCartControls(renderCartCallback, clearCartCallback) { // Передаем колбэки
    const cartIcon = document.getElementById('cartIcon');
    const cartPanel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    const closeCartBtn = document.getElementById('closeCart');
    const clearCartBtn = document.getElementById('clearCart');
    const successButton = document.getElementById('successButton');
    const successMessage = document.getElementById('successMessage');


    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (cartPanel) cartPanel.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            if (typeof renderCartCallback === 'function') {
                renderCartCallback(); // Вызываем колбэк для отрисовки корзины
            }
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartPanel) cartPanel.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (cartPanel) cartPanel.classList.remove('visible');
            if (successMessage) successMessage.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
        });
    }

    if (clearCartBtn && typeof clearCartCallback === 'function') {
        clearCartBtn.addEventListener('click', clearCartCallback); // Вызываем колбэк для очистки
    }

    if (successButton) {
        successButton.addEventListener('click', () => {
            if (successMessage) successMessage.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
        });
    }
}