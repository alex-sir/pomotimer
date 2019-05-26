const modal = document.querySelector('#simple-modal');
const modalBtn = document.querySelector('#modal-btn');
const closeBtn = document.querySelector('.close-btn');
const settings = document.querySelector('.settings');
const themes = document.querySelectorAll('.theme');
const body = document.querySelector('body');
const themeColor = document.querySelectorAll('.dark-color');
const themeBackground = document.querySelectorAll('.dark-');
const themeBorder = document.querySelectorAll('.dark-border');
let themeActive = document.querySelector('.dark-active');
const themeTitle = document.querySelector('.dark-title');
const themeWarningBackground = document.querySelector('.theme-warning-background');
const acceptRestart = document.querySelector('#accept-restart');
const declineRestart = document.querySelector('#decline-restart');

function modalDisplay(modal, modalBtn, closeBtn, settings) {
  modalBtn.addEventListener('click', () => {
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    settings.style.transform = 'rotate(90deg)';
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

function timerRestart(accept, decline, themeWarning, theme) {
  themeWarning.style.display = 'block';
  accept.addEventListener('click', () => {
    stop.click();
    executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modal);
    themeWarning.style.display = 'none';
  });
  decline.addEventListener('click', () => {
    themeWarning.style.display = 'none';
  });
  window.addEventListener('click', function (e) {
    if (e.target === themeWarning) themeWarning.style.display = 'none';
  });
}

function changeTheme(themes) {
  themes.forEach(theme => {
    theme.addEventListener('click', function () {
      if (timerStarted) timerRestart(acceptRestart, declineRestart, themeWarningBackground, theme);
      else executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modal);
    });
  });
}

function executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modal) {
  body.classList = '';
  body.classList.add(theme.classList[1]);
  themeColor.forEach(element => {
    element.classList.remove(element.classList[element.classList.length - 1]);
    element.classList.add(`${theme.classList[1]}-color`);
  });
  themeBorder.forEach(element => {
    element.classList.remove(element.classList[element.classList.length - 1]);
    element.classList.add(`${theme.classList[1]}-border`);
  });
  themeActive.classList.remove(themeActive.classList[themeActive.classList.length - 1]);
  themeActive.classList.add(`${theme.classList[1]}-active`);
  themeActive = document.querySelector(`.${theme.classList[1]}-active`);
  themeTitle.classList.remove(themeTitle.classList[themeTitle.classList.length - 1]);
  themeTitle.classList.add(`${theme.classList[1]}-title`);
  pomodoros.forEach(pomodoro => {
    pomodoro.classList.remove();
    pomodoro.classList.add(`${theme.classList[1]}-border`);
  });
  hideModal(modal, settings);
}

function hideModal(modal, settings) {
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
  }, 300);
  settings.style.transform = 'rotate(0deg)';
}

function main() {
  modalDisplay(modal, modalBtn, closeBtn, settings);
  changeTheme(themes);
}

window.onload = main();