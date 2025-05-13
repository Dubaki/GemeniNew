// Файл: js/app.js (ПОЛНАЯ ЗАМЕНА)
import { services as serviceData, renderServices } from './services.js';
import { cart, addToCart, renderCart, clearCart, showSuccessMessage, initializeCart } from './cart.js'; // showSuccessMessage теперь без аргументов
import { tg, initTelegram, setTelegramTheme, handleOrder } from './telegram.js';
import { initTabs, initAddressButton, initCartControls } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeCart(); 
    initTelegram();
    setTelegramTheme();
    initTabs();
    initAddressButton();
    initCartControls(renderCart, clearCart);
    renderServices('maintenance', serviceData.maintenance, addToCart);
    renderServices('electrical', serviceData.electrical, addToCart);

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
            
            const unmaskedPhone = phoneMaskInstance ? phoneMaskInstance.unmaskedValue : phone.replace(/\D/g, '');
            if (!unmaskedPhone || unmaskedPhone.length < 11) {
                if (tg && tg.showAlert) tg.showAlert('Пожалуйста, введите ваш номер телефона полностью.');
                else alert('Пожалуйста, введите ваш номер телефона полностью.');
                return;
            }

            if (cart.length === 0) {
                 if (tg && tg.showAlert) tg.showAlert('Ваша корзина пуста. Пожалуйста, выберите услугу.');
                else alert('Ваша корзина пуста. Пожалуйста, выберите услугу.');
                return;
            }

            const submitBtnOriginalText = submitCartButton.innerHTML;
            submitCartButton.disabled = true;
            submitCartButton.innerHTML = '<span class="loading"></span> Обработка...';
            
            // const orderedItemTitle = cart.length > 0 ? cart[0].title : "выбранные услуги"; // Больше не нужно передавать

            const success = await handleOrder(cart, phone, comment);

            submitCartButton.disabled = false;
            submitCartButton.innerHTML = submitBtnOriginalText;

            if (success) {
                showSuccessMessage(); // Вызываем без аргументов
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

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    if (tg && typeof tg.onEvent === 'function') {
        tg.onEvent('themeChanged', setTelegramTheme);
    }
    console.log("Приложение инициализировано с новым дизайном!");
});
