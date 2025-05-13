// File: api/create-order.js (ПОЛНАЯ ЗАМЕНА)

export default async function handler(req, res) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] /api/create-order: Request received! Method: ${req.method}, URL: ${req.url}`);

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log(`[${timestamp}] /api/create-order: Responding to OPTIONS preflight request`);
        res.status(204).end();
        return;
    }

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
        // ...
        // ------------------------------------------------------------------

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminChatId = 'ВАШ_TELEGRAM_ID_ДЛЯ_УВЕДОМЛЕНИЙ_АДМИНУ'; // Замените

        // --- Уведомление администратору ---
        if (botToken && adminChatId && adminChatId !== 'ВАШ_TELEGRAM_ID_ДЛЯ_УВЕДОМЛЕНИЙ_АДМИНУ') {
            let adminMessageText = `🔔 <b>Новый заказ от Mini App!</b>\n\n`;
            adminMessageText += `<b>Телефон:</b> ${orderData.phone || 'не указан'}\n`;
            if (orderData.userInfo) {
                adminMessageText += `<b>Клиент:</b> ${orderData.userInfo.first_name || ''} ${orderData.userInfo.last_name || ''} (@${orderData.userInfo.username || 'нет username'}, ID: ${orderData.userInfo.id})\n`;
            }
            adminMessageText += `<b>Сумма заказа:</b> ${orderData.totalPrice || 0} ₽\n\n`;
            adminMessageText += `<b>Заказанные услуги:</b>\n`;
            if (orderData.items && orderData.items.length > 0) {
                orderData.items.forEach(item => {
                    adminMessageText += `- ${item.title}\n`;
                });
            } else {
                adminMessageText += `- Корзина пуста\n`;
            }
            // ... (остальная часть уведомления админу без изменений) ...
            try {
                const adminNotifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: adminChatId, text: adminMessageText, parse_mode: 'HTML' })
                });
                const adminNotifyResult = await adminNotifyResponse.json();
                if (adminNotifyResult.ok) console.log(`[${timestamp}] /api/create-order: Admin notification sent.`);
                else console.error(`[${timestamp}] /api/create-order: Failed to send admin notification:`, adminNotifyResult);
            } catch (notifyError) { console.error(`[${timestamp}] /api/create-order: Error sending admin notification:`, notifyError); }
        }
        
        // --- Уведомление пользователю в чат ---
        if (orderData.userInfo && orderData.userInfo.id && botToken) {
            const userChatId = orderData.userInfo.id;
            let userMessageText = "<b>Ваша заявка принята!</b>\n\n";
            if (orderData.items && orderData.items.length > 0) {
                userMessageText += "Вы записаны на следующие услуги:\n";
                orderData.items.forEach(item => {
                    userMessageText += `- ${item.title}\n`;
                });
                userMessageText += "\n";
            }
            userMessageText += `Менеджер перезвонит вам с номера, окончание 0911, для подтверждения деталей.`;
            
            try {
                const userNotifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: userChatId, text: userMessageText, parse_mode: 'HTML' })
                });
                const userNotifyResult = await userNotifyResponse.json();
                if (userNotifyResult.ok) console.log(`[${timestamp}] /api/create-order: User confirmation sent to ${userChatId}.`);
                else console.error(`[${timestamp}] /api/create-order: Failed to send user confirmation:`, userNotifyResult);
            } catch (notifyError) { console.error(`[${timestamp}] /api/create-order: Error sending user confirmation:`, notifyError); }
        }

        console.log(`[${timestamp}] /api/create-order: Order processed (notifications attempt made).`);
        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно получен! Подробности отправлены вам в чат.',
            receivedOrderId: `ORDER_${Date.now()}`
        });

    } catch (error) {
        // ... (блок catch без изменений) ...
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
