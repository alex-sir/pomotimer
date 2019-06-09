// TODO: For modal, modularize HTML classes and id's, and JS functions and variables
const modalSettings = document.querySelector('#simple-modal-settings');
const modalAbout = document.querySelector('#simple-modal-about');
const modalBtnSettings = document.querySelector('#modal-btn-settings');
const modalBtnAbout = document.querySelector('#modal-btn-about');
const closeBtnSettings = document.querySelector('#close-btn-settings');
const closeBtnAbout = document.querySelector('#close-btn-about');
const settings = document.querySelector('.settings');
const about = document.querySelector('.about');

function modalDisplaySettings(modal, modalBtn, closeBtn, settings) {
    modalBtn.addEventListener('click', () => {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        settings.style.transform = 'rotate(90deg)';
        body.style.overflow = 'hidden';
        settings.blur();
    });
    closeBtn.addEventListener('click', () => {
        hideModalSettings(modal, settings);
    });
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            hideModalSettings(modal, settings);
        }
    });
}

function hideModalSettings(modal, settings) {
    modal.style.opacity = '0';
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
        body.style.overflow = 'hidden';
        about.blur();
    });
    closeBtn.addEventListener('click', () => {
        hideModalAbout(modal);
    });
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            hideModalAbout(modal);
        }
    });
}

function hideModalAbout(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.visibility = 'hidden';
    }, 300);
    body.style.overflow = 'auto';
}

function mainModal() {
    modalDisplaySettings(modalSettings, modalBtnSettings, closeBtnSettings, settings);
    modalDisplayAbout(modalAbout, modalBtnAbout, closeBtnAbout, about);
}

window.onload = mainModal();