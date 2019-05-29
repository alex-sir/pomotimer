const modal = document.querySelector('#simple-modal');
const modalBtn = document.querySelector('#modal-btn');
const closeBtn = document.querySelector('.close-btn');
const settings = document.querySelector('.settings');

function modalDisplay(modal, modalBtn, closeBtn, settings) {
    modalBtn.addEventListener('click', () => {
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        settings.style.transform = 'rotate(90deg)';
        body.style.overflow = 'hidden';
        settings.blur();
    });
    closeBtn.addEventListener('click', () => {
        hideModal(modal, settings);
    });
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            hideModal(modal, settings);
        }
    });
}

function hideModal(modal, settings) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.visibility = 'hidden';
    }, 300);
    settings.style.transform = 'rotate(0deg)';
    body.style.overflow = 'auto';
}

function main() {
    modalDisplay(modal, modalBtn, closeBtn, settings);
}

window.onload = main();