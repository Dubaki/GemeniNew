// Файл: GemeniNew/js/app.js
import { services as serviceData, renderServices } from './services.js'; // Импортируем данные об услугах и функцию рендера
import { cart, addToCart, renderCart, clearCart, showSuccessMessage } from './cart.js'; // Функции корзины
import { tg, initTelegram, setTelegramTheme, handleOrder } from './telegram.js'; // Функции Telegram и наш handleOrder
import { initTabs, initAddressButton, initCartControls } from './utils.js'; // Утилиты

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Инициализация Telegram WebApp (создает мок, если не в Telegram)
    initTelegram(); 

    // 2. Установка темы на основе Telegram или настроек ОС
    setTelegramTheme();

    // 3. Инициализация вкладок ("Техобслуживание", "Электрика")
    initTabs();

    // 4. Инициализация кнопки адреса (открывает карту)
    initAddressButton();

    // 5. Инициализация контролов корзины (открытие/закрытие панели, кнопка очистки)
    // Передаем функции renderCart и clearCart как колбэки
    initCartControls(renderCart, clearCart); 

    // 6. Рендер услуг на страницах вкладок
    // addToCart из cart.js будет передана в renderServices, чтобы кнопки "Добавить" работали
    renderServices('maintenance', serviceData.maintenance, addToCart); 
    renderServices('electrical', serviceData.electrical, addToCart);

    // 7. Инициализация кнопки "Оформить заказ" в панели корзины
    const submitCartButton = document.getElementById('submitCart');
    const phoneInputElement = document.getElementById('phoneInput'); // Нам нужно это поле

    if (submitCartButton && phoneInputElement) {
        submitCartButton.addEventListener('click', async () => {
            const phone = phoneInputElement.value;
            const comment = ""; // В этом дизайне нет поля для комментария в корзине, можно добавить если нужно.
                              // Либо удалить комментарий из handleOrder и данных для отправки.
                              // Пока оставим пустым.

            // Простая валидация телефона перед вызовом handleOrder
            // Можно использовать isValidPhone из нашего старого скрипта или более простую проверку.
            // Для примера, простая проверка на непустое значение:
            if (!phone.trim()) {
                if (tg && tg.showAlert) {
                    tg.showAlert('Пожалуйста, введите ваш номер телефона.');
                } else {
                    alert('Пожалуйста, введите ваш номер телефона.');
                }
                return;
            }

            const submitBtnOriginalText = submitCartButton.innerHTML;
            submitCartButton.disabled = true;
            submitCartButton.innerHTML = '<span class="loading"></span> Обработка...';

            // Вызываем наш handleOrder, который использует tg.sendData()
            // Передаем текущую корзину (cart из cart.js) и телефон
            const success = handleOrder(cart, phone, comment); // handleOrder теперь должна вернуть true/false или Promise
                                                             // Наша текущая handleOrder в telegram.js возвращает true для совместимости
                                                             // но на самом деле результат tg.sendData асинхронный

            // Независимо от результата handleOrder (т.к. tg.sendData асинхронный)
            // мы можем показать сообщение об успехе из deepseekapp
            // и очистить корзину локально.
            // Бэкенд должен обработать или не обработать данные.

            // Имитируем небольшую задержку для "обработки"
            setTimeout(() => {
                submitCartButton.disabled = false;
                submitCartButton.innerHTML = submitBtnOriginalText;

                // Вне зависимости от того, как отработал sendData (он асинхронный и не возвращает прямой результат успеха),
                // показываем пользователю сообщение об успехе и очищаем корзину.
                // Фактическая доставка заказа зависит от бэкенда.
                showSuccessMessage(); 

            }, 1000); // Имитация задержки
        });
    }

    // 8. Обновление иконок Feather Icons (если они есть на странице)
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // 9. Подписка на изменение темы Telegram (если доступно)
    if (tg && typeof tg.onEvent === 'function') {
        tg.onEvent('themeChanged', setTelegramTheme);
    }

    console.log("Приложение инициализировано с новым дизайном!");
    if (tg && tg.showAlert) {
        // tg.showAlert("Приложение загружено с новым дизайном! Некоторые функции могут быть в разработке.");
    }
});