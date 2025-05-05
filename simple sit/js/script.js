document.addEventListener('DOMContentLoaded', () => {

    // Получаем ссылки на основные элементы DOM
    const timelineEl = document.querySelector('.timeline');
    const modalOverlay = document.getElementById('overlay');

    // Элементы формы обратной связи
    const contactBtn = document.getElementById('contactBtn');
    const contactBox = document.getElementById('contactBox');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const contactForm = document.getElementById('contactForm');

    // Элементы галереи изображений (для превью на главной)
    const imageGalleryModal = document.getElementById('imageGalleryModal');
    const galleryImage = document.getElementById('galleryImage');
    const galleryPrevBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-prev') : null;
    const galleryNextBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-next') : null;
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryCaption = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-caption') : null;


    // Переменные для управления активным модальным окном и фокусом
    let activeModal = null;
    let previouslyFocusedElement = null;

    // Переменная для отслеживания текущего активного элемента события на временной шкале
    let activeEventElement = null;

    // Переменные для управления состоянием галереи превью на главной
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // === Общие функции для управления модальными окнами ===
    // (Эти функции остаются без изменений, они общие для всех модалок на этой странице)
    // ... openModal, closeModal, handleModalKeyDown ... (скопируйте их из предыдущей версии script.js)

    /**
     * Открывает любое модальное окно поверх оверлея.
     * @param {HTMLElement} modalElement - Элемент модального окна для открытия.
     */
    function openModal(modalElement) {
        if (!modalElement || activeModal) return;
        previouslyFocusedElement = document.activeElement;
        activeModal = modalElement;
        if (modalOverlay) {
            modalOverlay.classList.add('visible');
        }
        modalElement.classList.add('visible');
        modalElement.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            const focusableElements = modalElement.querySelectorAll(
                'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const visibleFocusableElements = Array.from(focusableElements).filter(el => el.offsetParent !== null);
            if (visibleFocusableElements.length > 0) {
                visibleFocusableElements[0].focus();
            } else {
                 if (modalElement.hasAttribute('tabindex')) {
                     modalElement.focus();
                 } else {
                     const closeButton = modalElement.querySelector('.close-btn');
                     if (closeButton) closeButton.focus();
                 }
            }
        }, 50);
        document.addEventListener('keydown', handleModalKeyDown);
    }

    /**
     * Закрывает текущее активное модальное окно.
     */
    function closeModal() {
        if (!activeModal) return;
        activeModal.classList.remove('visible');
        activeModal.setAttribute('aria-hidden', 'true');
        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
        }
        if (activeModal === imageGalleryModal && galleryImage) {
             galleryImage.src = '';
             galleryImage.alt = '';
             if (galleryCaption) galleryCaption.textContent = '';
             currentGalleryImages = [];
             currentImageIndex = 0;
         }
         if (activeModal === contactBox && contactForm) {
             contactForm.reset();
         }
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
        }
        activeModal = null;
        previouslyFocusedElement = null;
        document.removeEventListener('keydown', handleModalKeyDown);
    }

     /**
     * Обработчик нажатий клавиш для активного модального окна.
     */
     function handleModalKeyDown(event) {
        if (!activeModal) return;
        if (event.key === 'Escape') {
             closeModal();
            return;
        }
        if (event.key === 'Tab') {
             const focusableElements = activeModal.querySelectorAll(
                'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const visibleFocusableElements = Array.from(focusableElements).filter(el => el.offsetParent !== null);
             if (visibleFocusableElements.length === 0) {
                 event.preventDefault();
                 return;
             }
             if (visibleFocusableElements.length === 1 && visibleFocusableElements[0].classList.contains('close-btn')) {
                  return;
             }
             if (visibleFocusableElements.length === 1 && !visibleFocusableElements[0].classList.contains('close-btn')) {
                  event.preventDefault();
                  return;
             }
            const firstElement = visibleFocusableElements[0];
            const lastElement = visibleFocusableElements[visibleFocusableElements.length - 1];
            const currentFocus = document.activeElement;
            if (event.shiftKey) {
                if (currentFocus === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (currentFocus === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
        if (activeModal === imageGalleryModal) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                navigateImageGallery(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                navigateImageGallery(1);
            }
        }
    }


    // === Функции для управления модальным окном формы обратной связи ===
     function openContactModal() {
         openModal(contactBox);
    }
    function closeContactModal() {
         closeModal();
    }


    // === Функции для управления модальным окном галереи изображений на главной ===

     /**
     * Открывает модальную галерею изображений (на главной странице).
     * @param {number} startIndex - Индекс изображения, с которого начать показ.
     * @param {string[]} imagesArray - Массив URL-ов изображений для текущего события.
     */
    function openImageGallery(startIndex, imagesArray) {
         if (!imageGalleryModal || !galleryImage || !imagesArray || imagesArray.length === 0) {
             console.warn('Невозможно открыть галерею: отсутствуют элементы или изображения.');
             return;
         }
         currentGalleryImages = imagesArray;
         currentImageIndex = startIndex;
         updateGalleryImage();
         openModal(imageGalleryModal);
    }

    /**
     * Закрывает модальную галерею изображений (на главной странице).
     */
     function closeImageGallery() {
         closeModal();
    }

    /**
     * Переключает изображение в галерее (на главной странице).
     */
     function navigateImageGallery(direction) {
         if (!currentGalleryImages || currentGalleryImages.length <= 1) return;
         let newIndex = currentImageIndex + direction;
         if (newIndex < 0) {
             newIndex = currentGalleryImages.length - 1;
         } else if (newIndex >= currentGalleryImages.length) {
             newIndex = 0;
         }
         currentImageIndex = newIndex;
         updateGalleryImage();
         if(galleryImage) {
              galleryImage.focus();
          }
    }

    /**
     * Обновляет отображаемое изображение и состояние кнопок навигации (на главной странице).
     */
    function updateGalleryImage() {
        if (!galleryImage || !currentGalleryImages || currentGalleryImages.length === 0) {
            console.warn('Невозможно обновить изображение галереи: нет изображения или данных.');
            return;
        }
         galleryImage.src = '';
         galleryImage.alt = 'Загрузка...';
         const tempImg = new Image();
         tempImg.onload = () => {
              galleryImage.src = tempImg.src;
              galleryImage.alt = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`;
              if (galleryCaption) {
                  galleryCaption.textContent = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`;
              }
              if (currentGalleryImages.length > 1) {
                   if (galleryPrevBtn) { galleryPrevBtn.disabled = false; galleryPrevBtn.setAttribute('aria-disabled', 'false'); galleryPrevBtn.style.display = ''; galleryPrevBtn.setAttribute('aria-hidden', 'false'); }
                    if (galleryNextBtn) { galleryNextBtn.disabled = false; galleryNextBtn.setAttribute('aria-disabled', 'false'); galleryNextBtn.style.display = ''; galleryNextBtn.setAttribute('aria-hidden', 'false'); }
              } else {
                   if (galleryPrevBtn) { galleryPrevBtn.style.display = 'none'; galleryPrevBtn.setAttribute('aria-hidden', 'true'); }
                   if (galleryNextBtn) { galleryNextBtn.style.display = 'none'; galleryNextBtn.setAttribute('aria-hidden', 'true'); }
              }
              if(galleryImage) {
                  galleryImage.setAttribute('tabindex', '-1');
                  galleryImage.focus();
              }
         };
         tempImg.onerror = () => {
             console.error('Не удалось загрузить изображение:', currentGalleryImages[currentImageIndex]);
             galleryImage.src = '';
             galleryImage.alt = 'Ошибка загрузки изображения';
             if (galleryCaption) galleryCaption.textContent = 'Ошибка загрузки изображения';
         };
         tempImg.src = currentGalleryImages[currentImageIndex];
    }


    // === Функции для управления событиями временной шкалы ===

    /**
     * Переключает видимость описания события и выделяет элемент.
     * Генерирует HTML для описания и изображений.
     * @param {HTMLElement} eventElement - Элемент события (.event), по которому кликнули/нажали.
     */
    function toggleEventDescription(eventElement) {
        const year = eventElement?.dataset.year;
        const descriptionElement = eventElement?.querySelector('.event-description');
        const eventData = eventsInfo[year]; // eventsInfo теперь глобальная из data.js

        // Проверяем, является ли кликнутый/нажатый элемент действительным событием с data-year и данными
        if (!eventElement || !year || !descriptionElement || !eventData) {
             console.warn('Клик не на элементе события или нет данных для года:', year, eventElement);
            return;
        }

        // Если кликнули/нажали на уже активный элемент
        if (activeEventElement === eventElement) {
            eventElement.classList.remove('active');
            eventElement.setAttribute('aria-expanded', 'false');
            descriptionElement.innerHTML = '';
            activeEventElement = null;
            eventElement.focus();
            return;
        }

        // Если есть активный элемент, который не является текущим
        if (activeEventElement) {
            activeEventElement.classList.remove('active');
            activeEventElement.setAttribute('aria-expanded', 'false');
            const activeDescriptionElement = activeEventElement.querySelector('.event-description');
            if (activeDescriptionElement) {
                 activeDescriptionElement.innerHTML = '';
            }
        }

        // Устанавливаем текущий элемент как активный
        activeEventElement = eventElement;
        activeEventElement.classList.add('active');
        activeEventElement.setAttribute('aria-expanded', 'true');

        // Генерируем HTML для изображений
        let imagesHTML = '';
        if (eventData.images && eventData.images.length > 0) {
            imagesHTML = eventData.images.map((imageUrl, index) =>
                // Добавляем атрибут data-index для идентификации при клике
                `<img src="${imageUrl}" alt="Превью изображения ${index + 1} для события ${year}" class="event-image" data-index="${index}">`
            ).join('');
        }

        // Вставляем изображения и краткое описание
        descriptionElement.innerHTML = imagesHTML + eventData.description;

        // ** Добавляем обработчики клика на изображения после их добавления в DOM **
        const images = descriptionElement.querySelectorAll('.event-image');
        images.forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие
                const clickedIndex = parseInt(e.target.dataset.index, 10);
                if (eventData.images && eventData.images.length > clickedIndex) {
                    openImageGallery(clickedIndex, eventData.images); // Открываем галерею на главной
                } else {
                    console.warn('Не удалось открыть галерею: нет данных об изображениях или неверный индекс.');
                }
            });
        });

        // ** Добавляем кнопку "Читать статью", если есть данные для полной статьи **
         // Проверяем наличие articleTitle или fullContent для ссылки на статью
        if (eventData.articleTitle || eventData.fullContent) { // Проверяем, есть ли контент для статьи
            const readMoreBtn = document.createElement('button');
            readMoreBtn.textContent = 'Читать статью';
            readMoreBtn.classList.add('read-article-btn');

            // Ссылка ведет на article.html с параметром года
            readMoreBtn.addEventListener('click', (e) => {
                 e.stopPropagation(); // Предотвращаем всплытие
                window.location.href = `article.html?year=${year}`; // Переход на страницу статьи с параметром
            });
            descriptionElement.appendChild(readMoreBtn);
        }


        // Переводим фокус на элемент описания
        descriptionElement.setAttribute('tabindex', '-1');
        descriptionElement.focus();
    }


    // === Обработчики событий ===
    // (Эти обработчики остаются без изменений)
    // ... click и keydown на timelineEl, click на contactBtn, modalOverlay, contactCloseBtn, galleryCloseBtn, submit на contactForm, click на galleryPrevBtn, galleryNextBtn ...
    if (timelineEl) {
        timelineEl.addEventListener('click', (e) => {
             if (activeModal) return;
            const eventElement = e.target.closest('.event[data-year]');
            if (eventElement) {
                if (!e.target.classList.contains('event-image') && !e.target.classList.contains('read-article-btn')) {
                     toggleEventDescription(eventElement);
                }
            }
        });
         timelineEl.addEventListener('keydown', (e) => {
              if (activeModal) return;
            const eventElement = e.target.closest('.event[data-year]');
            if (eventElement && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                toggleEventDescription(eventElement);
            }
        });
    } else { console.warn("Элемент .timeline не найден."); }
    if (contactBtn) { contactBtn.addEventListener('click', openContactModal); } else { console.warn("Кнопка #contactBtn не найдена."); }
    if (modalOverlay) { modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } }); } else { console.warn("Элемент #overlay не найден."); }
    if (contactCloseBtn) { contactCloseBtn.addEventListener('click', closeContactModal); } else { console.warn("Кнопка #contactCloseBtn не найдена."); }
    if (galleryCloseBtn) { galleryCloseBtn.addEventListener('click', closeImageGallery); } else { console.warn("Кнопка #galleryCloseBtn не найдена."); }
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
    } else { console.warn("Форма #contactForm не найдена."); }
     if (galleryPrevBtn) { galleryPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(-1); }); } else { console.warn("Кнопка .gallery-prev не найдена."); }
    if (galleryNextBtn) { galleryNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(1); }); } else { console.warn("Кнопка .gallery-next не найдена."); }


    // Инициализация: добавление tabindex и ARIA
    document.querySelectorAll('.event[data-year]').forEach(eventEl => {
        if (!eventEl.hasAttribute('tabindex')) { eventEl.setAttribute('tabindex', '0'); }
        if (!eventEl.hasAttribute('role')) { eventEl.setAttribute('role', 'button'); }
        eventEl.setAttribute('aria-expanded', 'false');
    });
     if (contactBox && !contactBox.hasAttribute('tabindex')) { contactBox.setAttribute('tabindex', '-1'); }
    if (imageGalleryModal && !imageGalleryModal.hasAttribute('tabindex')) { imageGalleryModal.setAttribute('tabindex', '-1'); }
     document.querySelectorAll('.event-description').forEach(descEl => {
         if (!descEl.hasAttribute('tabindex')) { descEl.setAttribute('tabindex', '-1'); }
     });
     if (galleryImage && !galleryImage.hasAttribute('tabindex')) { galleryImage.setAttribute('tabindex', '-1'); }

});
