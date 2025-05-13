// Файл: js/telegram.js (ПОЛНАЯ ЗАМЕНА)

export let tg = window.Telegram && window.Telegram.WebApp;

// --- Функция initTelegram остается БЕЗ ИЗМЕНЕНИЙ ---
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
                    isVisible: false
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
                themeParams: {
                    bg_color: '#ffffff', text_color: '#000000', hint_color: '#707579',
                    link_color: '#2481cc', button_color: '#5288c1', button_text_color: '#ffffff',
                    secondary_bg_color: '#f1f1f1'
                },
                ready: () => console.log('MOCK: tg.WebApp.ready() called'),
                onEvent: (eventType, eventHandler) => console.log(`MOCK: tg.WebApp.onEvent for ${eventType} registered`),
                sendData: (data) => console.log('MOCK: tg.WebApp.sendData called with:', data), // Оставляем для совместимости, если где-то еще используется
                showAlert: (message) => alert(`MOCK TG ALERT: ${message}`),
                HapticFeedback: {
                    notificationOccurred: (type) => console.log(`MOCK: HapticFeedback.notificationOccurred: ${type}`)
                }
            }
        };
        tg = tg.WebApp;
        console.log('Telegram WebApp не обнаружен. Используется режим тестирования (расширенный мок).');
    }
    if (tg && tg.ready) { tg.ready(); }
    if (tg && tg.expand) { tg.expand(); }
}

// --- Функция setTelegramTheme остается БЕЗ ИЗМЕНЕНИЙ ---
export function setTelegramTheme() {
    if (tg && tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#e6f7ff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#003366');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0099cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#cceeff');
    } else {
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


// --- ИЗМЕНЕННАЯ ФУНКЦИЯ handleOrder ---
// Теперь использует fetch для отправки данных напрямую на бэкенд
// Возвращает Promise, который разрешается в true при успехе или false при ошибке
export async function handleOrder(cartData, phone, comment) {
    // Собираем данные заказа
    const orderDetails = {
        items: cartData.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, price: item.price })),
        totalPrice: cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        phone: phone,
        comment: comment,
        // Добавляем initDataUnsafe.user для информации о пользователе
        userInfo: (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user : null,
        // Можно добавить всю строку initData для проверки подлинности на бэкенде (требует доп. логики на бэкенде)
        // initDataRaw: (tg && tg.initData) ? tg.initData : null
    };

    // Указываем URL нашего нового бэкенд-эндпоинта
    // Используем относительный путь, если фронтенд и бэкенд на одном домене Vercel
    const backendUrl = '/api/create-order';
    // Если домены разные, используйте полный URL: const backendUrl = 'https://ВАШ_ДОМЕН.vercel.app/api/create-order';

    console.log(`[handleOrder] Attempting to POST order data to ${backendUrl}`);
    console.log(`[handleOrder] Data:`, orderDetails); // Логируем данные перед отправкой

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Можно добавить другие заголовки при необходимости
            },
            body: JSON.stringify(orderDetails), // Отправляем данные как JSON-строку
        });

        // Получаем ответ от сервера
        const responseData = await response.json();

        if (response.ok) { // Проверяем статус ответа (200-299)
            console.log('[handleOrder] Backend responded successfully:', responseData);
            // Можно показать сообщение об успехе из ответа сервера, если оно там есть
            // if (responseData.message && tg && tg.showAlert) {
            //     tg.showAlert(responseData.message);
            // }
            return true; // Успех
        } else {
            // Сервер вернул ошибку
            console.error('[handleOrder] Backend responded with error:', response.status, responseData);
            const errorMessage = responseData?.message || `Ошибка сервера: ${response.status}`;
            if (tg && tg.showAlert) {
                tg.showAlert(`Не удалось отправить заказ: ${errorMessage}`);
            } else {
                alert(`Не удалось отправить заказ: ${errorMessage}`);
            }
            return false; // Ошибка
        }
    } catch (error) {
        // Ошибка сети или другая ошибка при выполнении fetch
        console.error('[handleOrder] Network or fetch error:', error);
        if (tg && tg.showAlert) {
            tg.showAlert(`Ошибка сети при отправке заказа: ${error.message}`);
        } else {
            alert(`Ошибка сети при отправке заказа: ${error.message}`);
        }
        return false; // Ошибка
    }
}
