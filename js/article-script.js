document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const articleTitleEl = document.getElementById('articleTitle');
    const articleMetaEl = document.getElementById('articleMeta');
    const mainArticleImageEl = document.getElementById('mainArticleImage');
    const mainImageCaptionEl = document.getElementById('mainImageCaption');
    const articleContentEl = document.getElementById('articleContent');
    const pageTitleEl = document.getElementById('articlePageTitle');

    const modalOverlay = document.getElementById('overlay');
    const contactBox = document.getElementById('contactBox');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const contactBtn = document.getElementById('contactBtn');
    const contactForm = document.getElementById('contactForm');

    const imageGalleryModal = document.getElementById('imageGalleryModal');
    const galleryImage = document.getElementById('galleryImage');
    const galleryPrevBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-prev') : null;
    const galleryNextBtn = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-next') : null;
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryCaption = imageGalleryModal ? imageGalleryModal.querySelector('.gallery-caption') : null;

    // --- State Variables ---
    let activeModal = null;
    let previouslyFocusedElement = null;

    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // --- General Modal Functions ---
    function openModal(modalElement) {
        if (!modalElement || activeModal) return;

        previouslyFocusedElement = document.activeElement;
        activeModal = modalElement;

        if (modalOverlay) { modalOverlay.classList.add('visible'); }
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
                if (modalElement.hasAttribute('tabindex')) { modalElement.focus(); }
                else { const closeButton = modalElement.querySelector('.close-btn'); if (closeButton) closeButton.focus(); }
            }
        }, 50);

        document.addEventListener('keydown', handleModalKeyDown);
    }

    function closeModal() {
        if (!activeModal) return;

        activeModal.classList.remove('visible');
        activeModal.setAttribute('aria-hidden', 'true');
        if (modalOverlay) { modalOverlay.classList.remove('visible'); }

        if (activeModal === imageGalleryModal && galleryImage) {
            galleryImage.src = '';
            galleryImage.alt = '';
            if (galleryCaption) galleryCaption.textContent = '';
            currentGalleryImages = [];
            currentImageIndex = 0;
        }

        if (activeModal === contactBox && contactForm) { contactForm.reset(); }

        if (previouslyFocusedElement) { previouslyFocusedElement.focus(); }
        activeModal = null;
        previouslyFocusedElement = null;

        document.removeEventListener('keydown', handleModalKeyDown);
    }

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
            if (visibleFocusableElements.length === 0) { event.preventDefault(); return; }
            if (visibleFocusableElements.length === 1 && visibleFocusableElements[0].classList.contains('close-btn')) { return; }
            if (visibleFocusableElements.length === 1 && !visibleFocusableElements[0].classList.contains('close-btn')) { event.preventDefault(); return; }

            const firstElement = visibleFocusableElements[0];
            const lastElement = visibleFocusableElements[visibleFocusableElements.length - 1];
            const currentFocus = document.activeElement;

            if (event.shiftKey) {
                if (currentFocus === firstElement) { event.preventDefault(); lastElement.focus(); }
            } else {
                if (currentFocus === lastElement) { event.preventDefault(); firstElement.focus(); }
            }
        }

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

    function closeImageGallery() {
        closeModal();
    }

    function navigateImageGallery(direction) {
        if (!currentGalleryImages || currentGalleryImages.length <= 1) return;

        let newIndex = currentImageIndex + direction;
        if (newIndex < 0) { newIndex = currentGalleryImages.length - 1; }
        else if (newIndex >= currentGalleryImages.length) { newIndex = 0; }

        currentImageIndex = newIndex;
        updateGalleryImage();
        if (galleryImage) { galleryImage.focus(); }
    }

    function updateGalleryImage() {
        if (!galleryImage || !currentGalleryImages || currentGalleryImages.length === 0) {
            console.warn('Невозможно обновить изображение галереи.');
            return;
        }
        galleryImage.src = '';
        galleryImage.alt = 'Загрузка...';

        const tempImg = new Image();
        tempImg.onload = () => {
            galleryImage.src = tempImg.src;
            galleryImage.alt = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`;
            if (galleryCaption) { galleryCaption.textContent = `Изображение ${currentImageIndex + 1} из ${currentGalleryImages.length}`; }

            if (currentGalleryImages.length > 1) {
                if (galleryPrevBtn) { galleryPrevBtn.disabled = false; galleryPrevBtn.setAttribute('aria-disabled', 'false'); galleryPrevBtn.style.display = ''; galleryPrevBtn.setAttribute('aria-hidden', 'false'); }
                if (galleryNextBtn) { galleryNextBtn.disabled = false; galleryNextBtn.setAttribute('aria-disabled', 'false'); galleryNextBtn.style.display = ''; galleryNextBtn.setAttribute('aria-hidden', 'false'); }
            } else {
                if (galleryPrevBtn) { galleryPrevBtn.style.display = 'none'; galleryPrevBtn.setAttribute('aria-hidden', 'true'); }
                if (galleryNextBtn) { galleryNextBtn.style.display = 'none'; galleryNextBtn.setAttribute('aria-hidden', 'true'); }
            }
            if (galleryImage) { galleryImage.setAttribute('tabindex', '-1'); galleryImage.focus(); }
        };
        tempImg.onerror = () => {
            console.error('Не удалось загрузить изображение:', currentGalleryImages[currentImageIndex]);
            galleryImage.src = '';
            galleryImage.alt = 'Ошибка загрузки';
            if (galleryCaption) galleryCaption.textContent = 'Ошибка загрузки';
        };
        tempImg.src = currentGalleryImages[currentImageIndex];
    }

    // --- Article Loading Function ---
    function loadArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const year = urlParams.get('year');
        const articleData = eventsInfo ? eventsInfo[year] : null;

        if (articleData) {
            if (pageTitleEl) { pageTitleEl.textContent = articleData.articleTitle || articleData.yearText || 'Статья'; }
            if (articleTitleEl) { articleTitleEl.textContent = articleData.articleTitle || articleData.yearText || 'Статья'; }
            if (articleMetaEl) { articleMetaEl.textContent = articleData.articleMeta || ''; }

            if (mainArticleImageEl) {
                const mainImageUrl = articleData.mainImage || (articleData.images && articleData.images.length > 0 ? articleData.images[0] : null);
                if (mainImageUrl) {
                    mainArticleImageEl.src = mainImageUrl;
                    const altText = articleData.articleTitle || articleData.yearText || 'Изображение статьи';
                    mainArticleImageEl.alt = altText;
                    mainArticleImageEl.title = altText;
                    mainArticleImageEl.style.display = '';

                    if (mainImageCaptionEl) {
                        mainImageCaptionEl.textContent = articleData.mainImageCaption || altText;
                        mainImageCaptionEl.style.display = '';
                    }
                } else {
                    mainArticleImageEl.style.display = 'none';
                    if (mainImageCaptionEl) mainImageCaptionEl.style.display = 'none';
                }
            }

            if (articleContentEl) {
                articleContentEl.innerHTML = articleData.fullContent || '<p>Содержимое статьи отсутствует.</p>';

                const contentImages = articleContentEl.querySelectorAll('img');
                const imagesToGallery = Array.from(contentImages).map(img => img.src);

                contentImages.forEach((img, index) => {
                    img.dataset.index = index;
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const clickedIndex = parseInt(e.target.dataset.index, 10);
                        if (imagesToGallery.length > clickedIndex) {
                            openImageGallery(clickedIndex, imagesToGallery);
                        } else {
                            console.warn('Не удалось открыть галерею: неверный индекс изображения в контенте.');
                        }
                    });
                });
            }

        } else {
            if (pageTitleEl) pageTitleEl.textContent = 'Статья не найдена';
            if (articleTitleEl) articleTitleEl.textContent = 'Ошибка: Статья не найдена';
            if (articleMetaEl) articleMetaEl.textContent = '';
            if (mainArticleImageEl) mainArticleImageEl.style.display = 'none';
            if (mainImageCaptionEl) mainImageCaptionEl.style.display = 'none';
            if (articleContentEl) {
                articleContentEl.innerHTML = '<p>К сожалению, статья по выбранному событию не найдена.</p>';
            }
        }
    }

    // --- Event Listeners ---
    loadArticle();

    if (contactBtn) { contactBtn.addEventListener('click', openContactModal); }

    if (modalOverlay) { modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } }); }
    if (contactCloseBtn) { contactCloseBtn.addEventListener('click', closeContactModal); }

    if (galleryPrevBtn) { galleryPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(-1); }); }
    if (galleryNextBtn) { galleryNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateImageGallery(1); }); }
    if (galleryCloseBtn) { galleryCloseBtn.addEventListener('click', closeImageGallery); }

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
    if (contactBox && !contactBox.hasAttribute('tabindex')) { contactBox.setAttribute('tabindex', '-1'); }
    if (imageGalleryModal && !imageGalleryModal.hasAttribute('tabindex')) { imageGalleryModal.setAttribute('tabindex', '-1'); }
    if (galleryImage && !galleryImage.hasAttribute('tabindex')) { galleryImage.setAttribute('tabindex', '-1'); }
});
