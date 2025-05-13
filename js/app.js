// Файл: js/app.js (ПОЛНАЯ ЗАМЕНА)
import { services as serviceData, renderServices } from './services.js';
import { cart, addToCart, renderCart, clearCart, showSuccessMessage } from './cart.js';
import { tg, initTelegram, setTelegramTheme, handleOrder } from './telegram.js'; // handleOrder теперь async
import { initTabs, initAddressButton, initCartControls } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Инициализация Telegram WebApp
    initTelegram();

    // 2. Установка темы
    setTelegramTheme();

    // 3. Инициализация вкладок
    initTabs();

    // 4. Инициализация кнопки адреса
    initAddressButton();

    // 5. Инициализация контролов корзины
    initCartControls(renderCart, clearCart);

    // 6. Рендер услуг
    renderServices('maintenance', serviceData.maintenance, addToCart);
    renderServices('electrical', serviceData.electrical, addToCart);

    // 7. Инициализация кнопки "Оформить заказ" и ПОЛЯ ТЕЛЕФОНА
    const submitCartButton = document.getElementById('submitCart');
    const phoneInputElement = document.getElementById('phoneInput');
    let phoneMaskInstance = null; // Для доступа к экземпляру маски, если понадобится

    if (phoneInputElement && typeof IMask !== 'undefined') {
        phoneMaskInstance = IMask(phoneInputElement, {
            mask: '+{7} (000) 000-00-00',
            lazy: false,  // Показывает маску сразу
            placeholderChar: '_' // Символ для незаполненных мест
        });
    }

    if (submitCartButton && phoneInputElement) {
        submitCartButton.addEventListener('click', async () => { // Обработчик теперь async
            const phone = phoneInputElement.value; // Получаем отформатированное значение
            const comment = ""; // Комментарий пока не используется

            // Валидация телефона: проверяем, что введено достаточно цифр
            // (imaskjs хранит "чистое" значение в unmaskedValue)
            const unmaskedPhone = phoneMaskInstance ? phoneMaskInstance.unmaskedValue : phone.replace(/\D/g, '');

            // Российский номер после "7" содержит 10 цифр.
            // Если unmaskedValue начинается с "7", то его длина должна быть 11.
            // Если мы отбросили "7", то должно быть 10 цифр.
            // Учтем, что unmaskedValue у imask для "+{7}..." будет содержать "7"
            if (!unmaskedPhone || unmaskedPhone.length < 11) { // Проверяем, что всего 11 цифр (включая 7)
                if (tg && tg.showAlert) {
                    tg.showAlert('Пожалуйста, введите ваш номер телефона полностью.');
                } else {
                    alert('Пожалуйста, введите ваш номер телефона полностью.');
                }
                return;
            }

            const submitBtnOriginalText = submitCartButton.innerHTML;
            submitCartButton.disabled = true;
            submitCartButton.innerHTML = '<span class="loading"></span> Обработка...';

            // Вызываем наш handleOrder, который теперь async
            const success = await handleOrder(cart, phone, comment); // Дожидаемся результата

            // Логика после получения ответа от handleOrder
            submitCartButton.disabled = false;
            submitCartButton.innerHTML = submitBtnOriginalText;

            if (success) {
                // Сообщение об успехе, очистка корзины и т.д.
                showSuccessMessage(); // Эта функция уже очищает корзину и закрывает панель
                if (phoneMaskInstance) {
                    phoneMaskInstance.value = ''; // Очищаем поле телефона после успешного заказа
                } else {
                    phoneInputElement.value = '';
                }
            } else {
                // Ошибка уже должна была быть показана внутри handleOrder
                // (через tg.showAlert или alert)
                console.log("Произошла ошибка при оформлении заказа (детали должны были быть показаны).");
            }
        });
    }

    // 8. Обновление иконок Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // 9. Подписка на изменение темы Telegram
    if (tg && typeof tg.onEvent === 'function') {
        tg.onEvent('themeChanged', setTelegramTheme);
    }

    console.log("Приложение инициализировано с новым дизайном!");
});
