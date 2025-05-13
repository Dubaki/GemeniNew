// File: api/create-order.js (НОВЫЙ ФАЙЛ)

export default async function handler(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] /api/create-order: Request received! Method: ${req.method}, URL: ${req.url}`);

    // --- НАЧАЛО БЛОКА CORS ---
    // Устанавливаем заголовки CORS. В продакшене замените '*' на URL вашего Mini App.
    // Например: 'https://your-project-name.vercel.app' или тот URL, где хостится фронтенд
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Разрешаем POST и OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Разрешаем заголовок Content-Type

    // Обработка preflight-запроса OPTIONS (браузер отправляет его перед POST с другого домена)
    if (req.method === 'OPTIONS') {
        console.log(`[${timestamp}] /api/create-order: Responding to OPTIONS preflight request`);
        res.status(204).end(); // Отвечаем 204 No Content
        return;
    }
    // --- КОНЕЦ БЛОКА CORS ---

    // Обрабатываем только POST запросы
    if (req.method !== 'POST') {
        console.log(`[${timestamp}] /api/create-order: Method Not Allowed (${req.method})`);
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        res.status(405).json({ status: 'error', message: `Method ${req.method} Not Allowed` });
        return;
    }

    // Обработка основного POST запроса
    try {
        console.log(`[${timestamp}] /api/create-order: Processing POST request...`);

        // Получаем данные из тела запроса (Vercel автоматически парсит JSON)
        const orderData = req.body;

        // Проверка, что данные получены
        if (!orderData || typeof orderData !== 'object' || Object.keys(orderData).length === 0) {
            console.error(`[${timestamp}] /api/create-order: Invalid or empty request body received.`);
            return res.status(400).json({ status: 'error', message: 'Invalid or empty order data received.' });
        }

        console.log(`[${timestamp}] /api/create-order: Received order data:`, JSON.stringify(orderData, null, 2));

        // --- ДОБАВЬТЕ ЗДЕСЬ ВАШУ ЛОГИКУ ОБРАБОТКИ ЗАКАЗА ---
        // 1. Валидация данных: Проверьте phone, items, totalPrice и т.д.
        // 2. (Опционально) Проверка подлинности пользователя через orderData.initData (требует сложной логики проверки hash)
        // 3. Сохранение заказа в базу данных или отправка уведомления
        // 4. Например, можно отправить сообщение админу через API Telegram Bot
        // const adminChatId = 'ВАШ_АДМИН_CHAT_ID';
        // const botToken = process.env.TELEGRAM_BOT_TOKEN; // Токен лучше хранить в переменных окружения Vercel
        // const messageText = `Новый заказ:\nТелефон: ${orderData.phone}\nСумма: ${orderData.totalPrice} ₽\nСостав: ${orderData.items.map(i => i.title).join(', ')}`;
        // try {
        //    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        //        method: 'POST',
        //        headers: {'Content-Type': 'application/json'},
        //        body: JSON.stringify({ chat_id: adminChatId, text: messageText })
        //    });
        //    console.log(`[${timestamp}] /api/create-order: Admin notification sent.`);
        // } catch (notifyError) {
        //    console.error(`[${timestamp}] /api/create-order: Failed to send admin notification:`, notifyError);
        // }
        // --- КОНЕЦ ВАШЕЙ ЛОГИКИ ОБРАБОТКИ ЗАКАЗА ---

        console.log(`[${timestamp}] /api/create-order: Order processed successfully (placeholder).`);

        // Отправляем успешный ответ обратно в Мини-приложение
        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно получен и обрабатывается!', // Это сообщение можно показать в Mini App
            receivedOrderId: `ORDER_${Date.now()}` // Пример ID заказа
        });

    } catch (error) {
        // Обработка неожиданных ошибок
        console.error(`[${timestamp}] !!! UNEXPECTED ERROR in /api/create-order !!!`);
        console.error(`[${timestamp}] Error message: ${error.message}`);
        console.error(`[${timestamp}] Error stack: ${error.stack}`);
        if (req?.body) { // Логируем тело запроса при ошибке (если оно есть)
             try {
                 console.error(`[${timestamp}] Request body during error:`, JSON.stringify(req.body, null, 2));
             } catch {
                 console.error(`[${timestamp}] Request body during error (raw):`, req.body);
             }
        }
        res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера при обработке заказа.' });
    }
}
