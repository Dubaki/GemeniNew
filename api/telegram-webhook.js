// api/telegram-webhook.js

export default async function handler(request, response) {
    if (request.method === 'POST') {
        try {
            const BOT_TOKEN = process.env.BOT_TOKEN;
            const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

            if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
                console.error("BOT_TOKEN или ADMIN_CHAT_ID не установлены в переменных окружения.");
                return response.status(500).send("Ошибка конфигурации сервера");
            }

            const body = request.body; // Vercel автоматически парсит JSON тело запроса

            if (body && body.message && body.message.web_app_data) {
                const webAppData = body.message.web_app_data;
                const orderDataText = webAppData.data; // Это JSON строка из Mini App
                const telegramUser = body.message.from;

                try {
                    const orderDetails = JSON.parse(orderDataText);

                    // Формируем сообщение для администратора
                    let messageText = `🔔 Новая заявка!\n\n`;
                    messageText += `👤 От пользователя: ${telegramUser.first_name || ''} ${telegramUser.last_name || ''} (ID: ${telegramUser.id})\n`;
                    if (telegramUser.username) {
                        messageText += `Username: @${telegramUser.username}\n`;
                    }
                    messageText += `📞 Телефон: ${orderDetails.phone}\n`;
                    
                    if (orderDetails.comment) {
                        messageText += `💬 Комментарий: ${orderDetails.comment}\n`;
                    }

                    messageText += `\n🛠 Услуги:\n`;
                    orderDetails.items.forEach(item => {
                        messageText += `- ${item.name} (${item.price} руб.)\n`;
                    });
                    messageText += `\n💰 Итого: ${orderDetails.totalPrice} руб.`;

                    // Отправляем сообщение администратору через Telegram Bot API
                    const sendMessageUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                    
                    await fetch(sendMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: ADMIN_CHAT_ID,
                            text: messageText,
                            parse_mode: 'Markdown', // Можно использовать Markdown или HTML для форматирования
                        }),
                    });

                    console.log('Заявка успешно обработана и отправлена администратору.');
                    return response.status(200).send('Заявка получена');

                } catch (e) {
                    console.error('Ошибка парсинга данных заказа или отправки сообщения:', e);
                    return response.status(400).send('Ошибка в данных заказа');
                }
            } else {
                // Это может быть другое обновление от Telegram, не связанное с web_app_data
                console.log('Получено обновление, не являющееся web_app_data:', body);
                return response.status(200).send('Обновление получено, но не обработано как заявка');
            }

        } catch (error) {
            console.error('Общая ошибка в обработчике:', error);
            return response.status(500).send('Внутренняя ошибка сервера');
        }
    } else {
        // Обрабатываем только POST запросы
        return response.status(405).send('Метод не разрешен');
    }
}