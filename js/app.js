// Файл: js/app.js (ПОЛНАЯ ЗАМЕНА)
import { services as serviceData, renderServices } from './services.js';
// initializeCart теперь будет загружать данные и обновлять значок. addToCart и др. уже в cart.js
import { cart, addToCart, renderCart, clearCart, showSuccessMessage, initializeCart } from './cart.js';
import { tg, initTelegram, setTelegramTheme, handleOrder } from './telegram.js';
import { initTabs, initAddressButton, initCartControls } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Инициализация корзины (загрузка из localStorage, обновление значка)
    initializeCart(); // <--- НОВОЕ: загрузка корзины из localStorage

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

    // 6. Рендер услуг (теперь renderServices будет учитывать уже загруженную корзину)
    renderServices('maintenance', serviceData.maintenance, addToCart);
    renderServices('electrical', serviceData.electrical, addToCart);

    // 7. Инициализация кнопки "Оформить заказ" и ПОЛЯ ТЕЛЕФОНА
    const submitCartButton = document.getElementById('submitCart');
    const phoneInputElement = document.getElementById('phoneInput');
    let phoneMaskInstance = null;

    if (phoneInputElement && typeof IMask !== 'undefined') {
        phoneMaskInstance = IMask(phoneInputElement, {
            mask: '+{7} (000) 000-00-00',
            lazy: false,
            placeholderChar: '_'
        });
    }

    if (submitCartButton && phoneInputElement) {
        submitCartButton.addEventListener('click', async () => {
            const phone = phoneInputElement.value;
            const comment = "";
            
            // Валидация телефона
            const unmaskedPhone = phoneMaskInstance ? phoneMaskInstance.unmaskedValue : phone.replace(/\D/g, '');
            if (!unmaskedPhone || unmaskedPhone.length < 11) {
                if (tg && tg.showAlert) {
                    tg.showAlert('Пожалуйста, введите ваш номер телефона полностью.');
                } else {
                    alert('Пожалуйста, введите ваш номер телефона полностью.');
                }
                return;
            }

            // Проверка, есть ли что-то в корзине перед оформлением
            if (cart.length === 0) {
                 if (tg && tg.showAlert) {
                    tg.showAlert('Ваша корзина пуста. Пожалуйста, выберите услугу.');
                } else {
                    alert('Ваша корзина пуста. Пожалуйста, выберите услугу.');
                }
                return;
            }

            const submitBtnOriginalText = submitCartButton.innerHTML;
            submitCartButton.disabled = true;
            submitCartButton.innerHTML = '<span class="loading"></span> Обработка...';
            
            // Сохраняем название заказанной услуги ПЕРЕД тем, как cart может быть очищен
            const orderedItemTitle = cart.length > 0 ? cart[0].title : "выбранные услуги";

            const success = await handleOrder(cart, phone, comment);

            submitCartButton.disabled = false;
            submitCartButton.innerHTML = submitBtnOriginalText;

            if (success) {
                // Передаем название услуги в showSuccessMessage
                showSuccessMessage(orderedItemTitle); 
                if (phoneMaskInstance) {
                    phoneMaskInstance.value = ''; 
                } else {
                    phoneInputElement.value = '';
                }
            } else {
                console.log("Произошла ошибка при оформлении заказа.");
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
