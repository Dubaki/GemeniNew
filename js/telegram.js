// Файл: js/telegram.js (ПОЛНОСТЬЮ ЗАМЕНИТЬ НА ЭТОТ КОД ДЛЯ ТЕСТА)

export let tg = window.Telegram && window.Telegram.WebApp;

export function initTelegram() {
    if (!tg) {
        // Базовая заглушка для тестирования в браузере
        tg = {
            WebApp: {
                expand: () => console.log('MOCK: tg.WebApp.expand() called'),
                MainButton: {
                    show: () => console.log('MOCK: tg.WebApp.MainButton.show()'),
                    hide: () => console.log('MOCK: tg.WebApp.MainButton.hide()'),
                    setText: (text) => console.log(`MOCK: tg.WebApp.MainButton.setText("${text}")`),
                    onClick: (callback) => console.log('MOCK: tg.WebApp.MainButton.onClick registered'),
                    setParams: (params) => console.log('MOCK: tg.WebApp.MainButton.setParams', params),
                    isVisible: false // Начальное состояние мок-кнопки
                },
                initDataUnsafe: {
                    user: {
                        first_name: 'Test',
                        last_name: 'User',
                        id: 123456789,
                        username: 'testuser'
                    }
                },
                colorScheme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
                themeParams: { // Примерные параметры темы
                    bg_color: '#ffffff',
                    text_color: '#000000',
                    hint_color: '#707579',
                    link_color: '#2481cc',
                    button_color: '#5288c1',
                    button_text_color: '#ffffff',
                    secondary_bg_color: '#f1f1f1'
                },
                ready: () => console.log('MOCK: tg.WebApp.ready() called'),
                onEvent: (eventType, eventHandler) => console.log(`MOCK: tg.WebApp.onEvent for ${eventType} registered`),
                sendData: (data) => console.log('MOCK: tg.WebApp.sendData called with:', data),
                showAlert: (message) => alert(`MOCK TG ALERT: ${message}`), // Используем обычный alert для мока
                HapticFeedback: {
                    notificationOccurred: (type) => console.log(`MOCK: HapticFeedback.notificationOccurred: ${type}`)
                }
            }
        };
        // Поскольку tg.WebApp - это объект, присвоим его tg для единообразия с реальным API
        tg = tg.WebApp;
        console.log('Telegram WebApp не обнаружен. Используется режим тестирования (расширенный мок).');
    }

    // Эти вызовы должны быть здесь, так как они используют объект tg
    if (tg && tg.ready) {
        tg.ready();
    }
    if (tg && tg.expand) {
        tg.expand();
    }
    // MainButton в этом дизайне не используется, так что можно не инициализировать скрытие
    // if (tg && tg.MainButton && tg.MainButton.hide) {
    //     tg.MainButton.hide();
    // }
}

export function setTelegramTheme() {
    // Применяем реальные цвета темы Telegram, если они доступны
    if (tg && tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#e6f7ff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#003366');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0099cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#cceeff');
        // Можно добавить --accent-color, если он должен меняться с темой
        // document.documentElement.style.setProperty('--accent-color', tg.themeParams.link_color || '#0099cc');
    } else {
        // Фоллбэк (можно оставить как есть, если CSS определяет значения по умолчанию)
        if (tg && tg.colorScheme === 'dark') {
             document.documentElement.style.setProperty('--tg-theme-bg-color', '#1E1E1E');
             document.documentElement.style.setProperty('--tg-theme-text-color', '#FFFFFF');
             document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#2C2C2C');
        } else {
             document.documentElement.style.setProperty('--tg-theme-bg-color', '#F8F9FA');
             document.documentElement.style.setProperty('--tg-theme-text-color', '#000000');
             document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#FFFFFF');
        }
    }
}

// ВРЕМЕННАЯ ВЕРСИЯ ДЛЯ ТЕСТА: отправляет простую строку
export function handleOrder(cartData, phone, comment) {
    const testData = "TestData_123_From_MiniApp"; // Простая строка для теста
    console.log("Attempting to send SIMPLE test data:", testData); // Логируем простую строку

    if (tg && tg.sendData) {
        tg.sendData(testData); // Отправляем простую строку
    } else {
        console.error("tg.sendData is not available!");
    }
    return true; // Можем оставить true для совместимости с app.js
}
