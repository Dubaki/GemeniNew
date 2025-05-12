// File: api/telegram-webhook.js

export default function handler(req, res) {
  // Лог №1: Запрос получен
  console.log("--- Новый запрос получен ---");
  console.log("Время:", new Date().toISOString());
  console.log("Метод:", req.method);
  console.log("URL:", req.url);
  console.log("Заголовки:", JSON.stringify(req.headers, null, 2)); // Логируем заголовки

  // Попытка логировать тело запроса.
  // Для Vercel тело уже должно быть разобрано, если это JSON.
  // Если тело приходит в другом формате или его нужно стримить, потребуется другой подход.
  if (req.body) {
    console.log("Тело запроса (req.body):", JSON.stringify(req.body, null, 2));
  } else {
    console.log("Тело запроса (req.body) отсутствует или не разобрано.");
  }

  // Важно! Отправляем ответ Telegram, чтобы он не повторял запросы.
  res.status(200).json({ message: "Webhook received successfully by minimal logger" });
}
