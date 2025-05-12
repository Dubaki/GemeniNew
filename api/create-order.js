// File: api/create-order.js
export default async function handler(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] /api/create-order: Request received! Method: ${req.method}`);

    // 1. Установка CORS заголовков (ВАЖНО!)
    //    Разрешаем запросы от любого источника (для теста). В реальном приложении лучше указать конкретный URL вашего Mini App.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Обработка preflight-запроса OPTIONS (нужен для CORS)
    if (req.method === 'OPTIONS') {
        console.log(`[${timestamp}] /api/create-order: Responding to OPTIONS request`);
        res.status(200).end();
        return;
    }

    // 3. Обработка POST-запроса
    if (req.method === 'POST') {
        try {
            console.log(`[${timestamp}] /api/create-order: Processing POST request`);
            const orderData = req.body; // Vercel обычно автоматически парсит JSON body

            if (!orderData) {
                console.error(`[${timestamp}] /api/create-order: No request body received.`);
                return res.status(400).json({ status: 'error', message: 'No data received.' });
            }

            console.log(`[${timestamp}] /api/create-order: Received order data:`, JSON.stringify(orderData, null, 2));

            // ----- ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ ЗАКАЗА -----
            // - Валидация данных (телефон, корзина и т.д.)
            // - Проверка подлинности пользователя (можно использовать req.body.userInfo и проверять hash на бэкенде, но это сложнее)
            // - Сохранение заказа в базу данных
            // - Отправка уведомления администратору (например, через Telegram бота)
            // ---------------------------------------------
            console.log(`[${timestamp}] /api/create-order: Order processed successfully (simulated).`);

            // Отправляем успешный ответ обратно в Мини-приложение
            res.status(200).json({ status: 'success', message: 'Order received successfully!', receivedData: orderData });

        } catch (error) {
            console.error(`[${timestamp}] !!! ERROR in /api/create-order !!!`);
            console.error(`[${timestamp}] Error message: ${error.message}`);
            console.error(`[${timestamp}] Error stack: ${error.stack}`);
            if (req.body) {
                console.error(`[${timestamp}] Request body during error:`, JSON.stringify(req.body, null, 2));
            }
            res.status(500).json({ status: 'error', message: 'Internal server error processing order.', error: error.message });
        }
    } else {
        // Ответ на другие методы (GET и т.д.), если нужно
        console.log(`[<span class="math-inline">\{timestamp\}\] /api/create\-order\: Received non\-POST, non\-OPTIONS request \(</span>{req.method})`);
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}