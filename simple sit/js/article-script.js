// Скрипт для страницы статьи (article.html)
// Объект eventsInfo загружен из файла data.js

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    // Элементы для отображения контента статьи
    const articleTitleEl = document.getElementById('articleTitle');
    const articleMetaEl = document.getElementById('articleMeta');
    const mainArticleImageEl = document.getElementById('mainArticleImage');
    const mainImageCaptionEl = document.getElementById('mainImageCaption');
    const articleContentEl = document.getElementById('articleContent');
    const pageTitleEl = document.getElementById('articlePageTitle'); // Элемент <title> в head

    // Элементы модального оверлея и контактной формы (если они есть на странице статьи)
    const modalOverlay = document.getElementById('overlay');
    const contactBox = document.getElementById('contactBox');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const contactBtn = document.getElementById('contactBtn');
    const contactForm = document.getElementById('contactForm');

    // Элементы модальной галереи изображений (если она есть на странице статьи)
    const imageGalleryModal = document.getElementById('imageGalleryModal');
    const galleryImage = document.getElementById('galleryImage');
    const galleryPrevBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-prev') : null;
    const galleryNextBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-next') : null;
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryCaption = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-caption') : null;


    // --- State Variables ---
    // Переменные для управления активным модальным окном и фокусом
    let activeModal = null;
    let previouslyFocusedElement = null;

    // Переменные для управления состоянием галереи изображений
    let currentGalleryImages = [];
    let currentImageIndex = 0;


    // --- General Modal Functions ---
    /**
     * Открывает модальное окно и управляет оверлеем и фокусом.
     * @param {HTMLElement} modalElement - Элемент модального окна.
     */
    function openModal(modalElement) {
        if (!modalElement || activeModal) return;

        previouslyFocusedElement = document.activeElement;
        activeModal = modalElement;

        if (modalOverlay) { modalOverlay.classList.add('visible'); }
        modalElement.classList.add('visible');
        modalElement.setAttribute('aria-hidden', 'false');

        // Небольшая задержка для корректной установки фокуса после анимации появления
        setTimeout(() => {
            const focusableElements = modalElement.querySelectorAll(
                'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const visibleFocusableElements = Array.from(focusableElements).filter(el => el.offsetParent !== null);

            if (visibleFocusableElements.length > 0) {
                visibleFocusableElements[0].focus();
            } else {
                 // Фокусировка на самой модалке или кнопке закрытия
                 if (modalElement.hasAttribute('tabindex')) { modalElement.focus(); }
                 else { const closeButton = modalElement.querySelector('.close-btn'); if (closeButton) closeButton.focus(); }
            }
        }, 50);

        document.addEventListener('keydown', handleModalKeyDown);
    }

    /**
     * Закрывает текущее активное модальное окно.
     * Очищает состояние и восстанавливает фокус.
     */
    function closeModal() {
        if (!activeModal) return;

        activeModal.classList.remove('visible');
        activeModal.setAttribute('aria-hidden', 'true');
        if (modalOverlay) { modalOverlay.classList.remove('visible'); }

         // Очистка галереи при закрытии
         if (activeModal === imageGalleryModal && galleryImage) {
             galleryImage.src = '';
             galleryImage.alt = '';
             if (galleryCaption) galleryCaption.textContent = '';
             currentGalleryImages = [];
             currentImageIndex = 0;
         }
         // Очистка формы при закрытии
         if (activeModal === contactBox && contactForm) { contactForm.reset(); }

        if (previouslyFocusedElement) { previouslyFocusedElement.focus(); }
        activeModal = null;
        previouslyFocusedElement = null;

        document.removeEventListener('keydown', handleModalKeyDown);
    }

     /**
     * Обработчик нажатий клавиш для активного модального окна (Escape для закрытия, Tab для ловушки фокуса, стрелки для галереи).
     * @param {KeyboardEvent} event - Событие клавиатуры.
     */
     function handleModalKeyDown(event) {
        if (!activeModal) return;

        // Закрытие по клавише Escape
        if (event.key === 'Escape') {
             closeModal();
            return;
        }

        // Ловушка фокуса по клавише Tab
        if (event.key === 'Tab') {
             const focusableElements = activeModal.querySelectorAll(
                'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const visibleFocusableElements = Array.from(focusableElements).filter(el => el.offsetParent !== null);
             if (visibleFocusableElements.length === 0) { event.preventDefault(); return; }
             if (visibleFocusableElements.length === 1 && visibleFocusableElements[0].classList.contains('close-btn')) { return; }
             if (visibleFocusableElements.length === 1 && !visibleFocusableElements[0].classList.contains('close-btn')) { event.preventDefault(); return; }

            const firstElement = visibleFocusableElements[0];
            const lastElement = visibleFocusableElements[visibleFocusableElements.length - 1];
            const currentFocus = document.activeElement;

            if (event.shiftKey) { // Shift + Tab
                if (currentFocus === firstElement) { event.preventDefault(); lastElement.focus(); }
            } else { // Tab
                if (currentFocus === lastElement) { event.preventDefault(); firstElement.focus(); }
            }
        }

        // Навигация по галерее с помощью стрелок (только если активна галерея)
        if (activeModal === imageGalleryModal) {
            if (event.key === 'ArrowLeft') { event.preventDefault(); navigateImageGallery(-1); }
            else if (event.key === 'ArrowRight') { event.preventDefault(); navigateImageGallery(1); }
        }
    }


    // --- Contact Form Modal Functions (if present) ---
     function openContactModal() {
         openModal(contactBox);
    }
    function closeContactModal() {
         closeModal();
    }


    // --- Image Gallery Modal Functions (if present) ---

    /**
     * Открывает модальную галерею изображений.
     * @param {number} startIndex - Индекс изображения для показа в массиве imagesArray.
     * @param {string[]} imagesArray - Массив URL-ов изображений для галереи.
     */
    function openImageGallery(startIndex, imagesArray) {
         if (!imageGalleryModal || !galleryImage || !imagesArray || imagesArray.length === 0) {
             console.warn('Невозможно открыть галерею.');
             return;
         }
         currentGalleryImages = imagesArray;
         currentImageIndex = startIndex;
         updateGalleryImage();
         openModal(imageGalleryModal);
    }

    /**
     * Закрывает модальную галерею изображений.
     */
     function closeImageGallery() {
         closeModal();
    }

    /**
     * Переключает изображение в галерее.
     * @param {number} direction - Направление (-1 назад, 1 вперед).
     */
     function navigateImageGallery(direction) {
         if (!currentGalleryImages || currentGalleryImages.length <= 1) return;

         let newIndex = currentImageIndex + direction;
         // Зацикливание галереи
         if (newIndex < 0) { newIndex = currentGalleryImages.length - 1; }
         else if (newIndex >= currentGalleryImages.length) { newIndex = 0; }

         currentImageIndex = newIndex;
         updateGalleryImage();
         if(galleryImage) { galleryImage.focus(); } // Фокусируем изображение для доступности
    }

    /**
     * Обновляет отображаемое изображение в галерее и состояние кнопок навигации.
     */
    function updateGalleryImage() {
        if (!galleryImage || !currentGalleryImages || currentGalleryImages.length === 0) {
            console.warn('Невозможно обновить изображение галереи.');
            return;
        }
         galleryImage.src = ''; // Очищаем src перед загрузкой нового для плавного перехода
         galleryImage.alt = 'Загрузка...';

         const tempImg = new Image(); // Временное изображение для предзагрузки
         tempImg.onload = () => {
              galleryImage.src = tempImg.src;
              galleryImage.alt = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`;
              if (galleryCaption) { galleryCaption.textContent = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`; }

              // Управляем видимостью кнопок навигации (скрываем, если одно изображение)
              if (currentGalleryImages.length > 1) {
                   if (galleryPrevBtn) { galleryPrevBtn.disabled = false; galleryPrevBtn.setAttribute('aria-disabled', 'false'); galleryPrevBtn.style.display = ''; galleryPrevBtn.setAttribute('aria-hidden', 'false'); }
                   if (galleryNextBtn) { galleryNextBtn.disabled = false; galleryNextBtn.setAttribute('aria-disabled', 'false'); galleryNextBtn.style.display = ''; galleryNextBtn.setAttribute('aria-hidden', 'false'); }
              } else {
                   if (galleryPrevBtn) { galleryPrevBtn.style.display = 'none'; galleryPrevBtn.setAttribute('aria-hidden', 'true'); }
                   if (galleryNextBtn) { galleryNextBtn.style.display = 'none'; galleryNextBtn.setAttribute('aria-hidden', 'true'); }
              }
              if(galleryImage) { galleryImage.setAttribute('tabindex', '-1'); galleryImage.focus(); } // Фокусируем изображение после загрузки
         };
         tempImg.onerror = () => {
             console.error('Не удалось загрузить изображение:', currentGalleryImages[currentImageIndex]);
             galleryImage.src = '';
             galleryImage.alt = 'Ошибка загрузки';
             if (galleryCaption) galleryCaption.textContent = 'Ошибка загрузки';
         };
         tempImg.src = currentGalleryImages[currentImageIndex]; // Запускаем загрузку
    }


    // --- Article Loading Function ---

    /**
     * Загружает и отображает контент статьи на основе параметра 'year' из URL.
     * Добавляет слушатели клика для изображений в контенте для открытия галереи.
     */
    function loadArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const year = urlParams.get('year');
        // eventsInfo предполагается глобально доступным из data.js
        const articleData = eventsInfo ? eventsInfo[year] : null;

        // Если данные статьи найдены
        if (articleData) {
            // Обновляем заголовок страницы и элементы статьи
            if (pageTitleEl) { pageTitleEl.textContent = articleData.articleTitle || articleData.yearText || 'Статья'; }
            if (articleTitleEl) { articleTitleEl.textContent = articleData.articleTitle || articleData.yearText || 'Статья'; }
            if (articleMetaEl) { articleMetaEl.textContent = articleData.articleMeta || ''; }

            // Обновляем главное изображение
            if (mainArticleImageEl) {
                const mainImageUrl = articleData.mainImage || (articleData.images && articleData.images.length > 0 ? articleData.images[0] : null);
                if (mainImageUrl) {
                     mainArticleImageEl.src = mainImageUrl;
                     const altText = articleData.articleTitle || articleData.yearText || 'Изображение статьи';
                     mainArticleImageEl.alt = altText;
                     // ** Добавляем атрибут title для подсказки **
                     mainArticleImageEl.title = altText; // Используем тот же текст, что и для alt

                     mainArticleImageEl.style.display = '';

                     if(mainImageCaptionEl) {
                         // Можно использовать отдельное поле для подписи, если оно есть
                         mainImageCaptionEl.textContent = articleData.mainImageCaption || altText; // Используем altText или отдельное поле, если есть
                         mainImageCaptionEl.style.display = '';
                     }
                } else {
                    mainArticleImageEl.style.display = 'none';
                     if(mainImageCaptionEl) mainImageCaptionEl.style.display = 'none';
                }
            }

            // Вставляем основной контент статьи
            if (articleContentEl) {
                articleContentEl.innerHTML = articleData.fullContent || '<p>Содержимое статьи отсутствует.</p>';

                // ** Добавляем слушатели клика к изображениям внутри контента статьи **
                // (Этот код уже добавляет слушатели и использует alt/title, если они есть в fullContent)
                const contentImages = articleContentEl.querySelectorAll('img');
                // Собираем URL всех изображений в контенте для галереи
                const imagesToGallery = Array.from(contentImages).map(img => img.src);

                contentImages.forEach((img, index) => {
                    img.dataset.index = index; // Добавляем индекс изображения
                    img.addEventListener('click', (e) => {
                        e.stopPropagation(); // Предотвращаем всплытие
                        const clickedIndex = parseInt(e.target.dataset.index, 10);
                        if (imagesToGallery.length > clickedIndex) {
                            // Открываем галерею, передавая URL всех изображений из контента
                            openImageGallery(clickedIndex, imagesToGallery);
                        } else {
                             console.warn('Не удалось открыть галерею: неверный индекс изображения в контенте.');
                        }
                    });
                });
            }

        } else {
            // Если данные статьи не найдены
            if (pageTitleEl) pageTitleEl.textContent = 'Статья не найдена';
            if (articleTitleEl) articleTitleEl.textContent = 'Ошибка: Статья не найдена';
            if (articleMetaEl) articleMetaEl.textContent = '';
            if (mainArticleImageEl) mainArticleImageEl.style.display = 'none';
             if(mainImageCaptionEl) mainImageCaptionEl.style.display = 'none';
            if (articleContentEl) {
                articleContentEl.innerHTML = '<p>К сожалению, статья по выбранному событию не найдена.</p>';
            }
        }
    }


    // --- Event Listeners ---

    // Загрузка статьи при загрузке страницы
    loadArticle();

    // Обработчик клика на кнопку "Связаться с нами" (если она есть)
    if (contactBtn) { contactBtn.addEventListener('click', openContactModal); }

    // Обработчики закрытия модалки контакта (если есть) и клика по оверлею
    if (modalOverlay) { modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } }); }
    if (contactCloseBtn) { contactCloseBtn.addEventListener('click', closeContactModal); }

    // Обработчики кнопок галереи (если она есть)
    if (galleryPrevBtn) { galleryPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(-1); }); }
    if (galleryNextBtn) { galleryNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(1); }); }
    if (galleryCloseBtn) { galleryCloseBtn.addEventListener('click', closeImageGallery); }

    // Обработчик отправки формы обратной связи (если она есть)
     if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!contactForm.checkValidity()) { console.warn("Форма заполнена некорректно."); return; }
            const email = contactForm.email.value;
            const subject = contactForm.subject.value;
            const message = contactForm.message.value;
            console.log("Форма валидна. Данные:", { email, subject, message });
            alert('Сообщение отправлено (эмуляция).');
            closeContactModal();
        });
    }


    // --- Initialization / Accessibility ---
    // Добавление tabindex для фокусировки модальных окон и элементов в них
     if (contactBox && !contactBox.hasAttribute('tabindex')) { contactBox.setAttribute('tabindex', '-1'); }
     if (imageGalleryModal && !imageGalleryModal.hasAttribute('tabindex')) { imageGalleryModal.setAttribute('tabindex', '-1'); }
     if (galleryImage && !galleryImage.hasAttribute('tabindex')) { galleryImage.setAttribute('tabindex', '-1'); }

     // Изображения в контенте статьи получают слушатели клика динамически в loadArticle
});
