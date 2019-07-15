// Settings
const modalSettings = document.querySelector('#simple-modal-settings');
const modalBtnSettings = document.querySelector('#modal-btn-settings');
const closeBtnSettings = document.querySelector('#close-btn-settings');
const settings = document.querySelector('.settings');
// About
const modalAbout = document.querySelector('#simple-modal-about');
const modalBtnAbout = document.querySelector('#modal-btn-about');
const closeBtnAbout = document.querySelector('#close-btn-about');
const about = document.querySelector('.about');
// Accessibility
const timerContainerElements = document.querySelectorAll('.container *');

function modalDisplaySettings(modal, modalBtn, closeBtn, settings) {
    modalBtn.addEventListener('click', () => {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        settings.style.transform = 'rotate(90deg)';
        // FIXME: Modal background elements shouldn't be tabable
        // timerContainerElements.forEach(timerContainerElement => {
        //     timerContainerElement.setAttribute('tabindex', '-1');
        // });
        // modalBtnSettings.setAttribute('tabindex', '-1');
        // modalBtnAbout.setAttribute('tabindex', '-1');
        body.style.overflow = 'hidden';
        settings.blur();
    });
    closeBtn.addEventListener('click', () => {
        hideModalSettings(modal, settings);
    });
    document.addEventListener('keydown', e => {
        if (document.activeElement === closeBtnSettings &&
            (e.keyCode === 32 || e.keyCode === 13)) {
            hideModalSettings(modal, settings);
        }
    });
    window.addEventListener('click', e => {
        if (e.target === modal) {
            hideModalSettings(modal, settings);
        }
    });
}

function hideModalSettings(modal, settings) {
    modal.style.opacity = '0';
    // timerContainerElements.forEach(timerContainerElement => {
    //     timerContainerElement.setAttribute('tabindex', '0');
    // });
    // modalBtnSettings.setAttribute('tabindex', '0');
    // modalBtnAbout.setAttribute('tabindex', '0');
    setTimeout(() => {
        modal.style.visibility = 'hidden';
    }, 300);
    settings.style.transform = 'rotate(0deg)';
    body.style.overflow = 'auto';
}

function modalDisplayAbout(modal, modalBtn, closeBtn, about) {
    modalBtn.addEventListener('click', () => {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        about.style.transform = 'scale(0.85)';
        body.style.overflow = 'hidden';
        about.blur();
    });
    closeBtn.addEventListener('click', () => {
        hideModalAbout(modal, about);
    });
    document.addEventListener('keydown', e => {
        if (document.activeElement === closeBtnAbout &&
            (e.keyCode === 32 || e.keyCode === 13)) {
            hideModalAbout(modal, about);
        }
    });
    window.addEventListener('click', e => {
        if (e.target === modal) {
            hideModalAbout(modal, about);
        }
    });
}

function hideModalAbout(modal, about) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.visibility = 'hidden';
    }, 300);
    about.style.transform = 'scale(1)';
    body.style.overflow = 'auto';
}

/**
 * @param {HTMLElement} modal
 * @param {HTMLElement} modalBtn
 * @param {HTMLElement} closeBtn
 * @return {void}
 */
function modalDisplayGeneric(modal, modalBtn, closeBtn) {
    modalBtn.addEventListener('click', () => {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        body.style.overflow = 'hidden';
    });
    closeBtn.addEventListener('click', () => {
        hideModalGeneric(modal);
    });
    window.addEventListener('click', e => {
        if (e.target === modal) hideModalGeneric(modal);
    });
}

/**
 * @param {HTMLElement} modal
 * @return {void}
 */
function hideModalGeneric(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.visibility = 'hidden';
    }, 300);
    body.style.overflow = 'auto';
}

function mainModal() {
    // Modals
    modalDisplaySettings(modalSettings, modalBtnSettings, closeBtnSettings, settings);
    modalDisplayAbout(modalAbout, modalBtnAbout, closeBtnAbout, about)
}

window.onload = mainModal();