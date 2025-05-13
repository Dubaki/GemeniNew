// File: api/create-order.js (ОБНОВЛЕННЫЙ КОД)

export default async function handler(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] /api/create-order: Request received! Method: ${req.method}, URL: ${req.url}`);

    // --- НАЧАЛО БЛОКА CORS ---
    res.setHeader('Access-Control-Allow-Origin', '*'); // В продакшене замените '*' на URL вашего Mini App
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log(`[${timestamp}] /api/create-order: Responding to OPTIONS preflight request`);
        res.status(204).end();
        return;
    }
    // --- КОНЕЦ БЛОКА CORS ---

    if (req.method !== 'POST') {
        console.log(`[${timestamp}] /api/create-order: Method Not Allowed (${req.method})`);
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        res.status(405).json({ status: 'error', message: `Method ${req.method} Not Allowed` });
        return;
    }

    try {
        console.log(`[${timestamp}] /api/create-order: Processing POST request...`);
        const orderData = req.body;

        if (!orderData || typeof orderData !== 'object' || Object.keys(orderData).length === 0) {
            console.error(`[${timestamp}] /api/create-order: Invalid or empty request body received.`);
            return res.status(400).json({ status: 'error', message: 'Invalid or empty order data received.' });
        }

        console.log(`[${timestamp}] /api/create-order: Received order data:`, JSON.stringify(orderData, null, 2));

        // ----- ВАША ЛОГИКА ОБРАБОТКИ ЗАКАЗА (сохранение в БД и т.д.) -----
        // ... (здесь вы можете сохранять заказ, если нужно) ...
        // ------------------------------------------------------------------

        // ----- ОТПРАВКА УВЕДОМЛЕНИЯ В TELEGRAM -----
        const botToken = process.env.TELEGRAM_BOT_TOKEN; // Получаем токен из переменных окружения Vercel
        const targetChatId = 'ВАШ_TELEGRAM_ID_ДЛЯ_УВЕДОМЛЕНИЙ'; // <--- ЗАМЕНИТЕ ЭТО НА НУЖНЫЙ ID

        if (!botToken) {
            console.error(`[${timestamp}] /api/create-order: TELEGRAM_BOT_TOKEN is not set in environment variables.`);
            // Не прерываем заказ, но логируем ошибку
        } else if (!targetChatId || targetChatId === 'ВАШ_TELEGRAM_ID_ДЛЯ_УВЕДОМЛЕНИЙ') {
            console.error(`[${timestamp}] /api/create-order: targetChatId is not set correctly.`);
        } else {
            let messageText = `🔔 <b>Новый заказ!</b>\n\n`;
            messageText += `<b>Телефон:</b> ${orderData.phone || 'не указан'}\n`;
            if (orderData.userInfo) {
                messageText += `<b>Клиент:</b> ${orderData.userInfo.first_name || ''} ${orderData.userInfo.last_name || ''} (@${orderData.userInfo.username || 'нет username'})\n`;
            }
            messageText += `<b>Сумма заказа:</b> ${orderData.totalPrice || 0} ₽\n\n`;
            messageText += `<b>Состав заказа:</b>\n`;
            if (orderData.items && orderData.items.length > 0) {
                orderData.items.forEach(item => {
                    messageText += `- ${item.title} (ID: ${item.id}) x ${item.quantity} = ${item.price * item.quantity} ₽\n`;
                });
            } else {
                messageText += `- Корзина пуста\n`;
            }
            if (orderData.comment) {
                messageText += `\n<b>Комментарий:</b> ${orderData.comment}\n`;
            }

            const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            try {
                const notificationResponse = await fetch(telegramApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: targetChatId,
                        text: messageText,
                        parse_mode: 'HTML' // Используем HTML для форматирования (<b>, <i>, <a>, <pre>, <code>)
                    })
                });
                const notificationResult = await notificationResponse.json();
                if (notificationResult.ok) {
                    console.log(`[${timestamp}] /api/create-order: Admin notification sent successfully to chat_id ${targetChatId}.`);
                } else {
                    console.error(`[${timestamp}] /api/create-order: Failed to send admin notification. Response:`, JSON.stringify(notificationResult));
                }
            } catch (notifyError) {
                console.error(`[${timestamp}] /api/create-order: Error sending admin notification:`, notifyError);
            }
        }
        // --- КОНЕЦ ОТПРАВКИ УВЕДОМЛЕНИЯ ---

        console.log(`[${timestamp}] /api/create-order: Order processed (notification attempt made).`);
        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно получен и обрабатывается!',
            receivedOrderId: `ORDER_${Date.now()}`
        });

    } catch (error) {
        console.error(`[${timestamp}] !!! UNEXPECTED ERROR in /api/create-order !!!`);
        console.error(`[${timestamp}] Error message: ${error.message}`);
        console.error(`[${timestamp}] Error stack: ${error.stack}`);
        if (req?.body) {
             try {
                 console.error(`[${timestamp}] Request body during error:`, JSON.stringify(req.body, null, 2));
             } catch {
                 console.error(`[${timestamp}] Request body during error (raw):`, req.body);
             }
        }
        res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера при обработке заказа.' });
    }
}
