const themes = document.querySelectorAll('.theme');
const body = document.querySelector('body');
const themeColor = document.querySelectorAll('.dark-color');
const themeBackground = document.querySelectorAll('.dark-background');
const themeBorder = document.querySelectorAll('.dark-border');
let themeActive = document.querySelector('.dark-active');
const themeTitle = document.querySelector('.dark-title');
const themeWarningBackground = document.querySelector('.theme-warning-background');
const acceptRestart = document.querySelector('#accept-restart');
const declineRestart = document.querySelector('#decline-restart');
let customValueBody;
let customValueContent;
const applyCustomTheme = document.querySelector('#apply-custom-theme');
let customThemeActive = false;
// Theme
let themeClass = document.querySelector('body').classList[0];
// Custom theme
let bodyBackgroundColor = window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color');
let iconsColor = window.getComputedStyle(sessionTitle).getPropertyValue('color');

// TODO: Modal should also change color OR make it dark mode (not sure which one is better)
// TODO: Add documentation to this file

function setStorageTheme() {
    if ((window.localStorage.length === 0 || !localStorage.getItem('themeClass')) &&
        storageAvailable('localStorage')) {
        // Theme
        localStorage.setItem('themeClass', JSON.stringify(themeClass));
        // Custom theme
        localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
        localStorage.setItem('bodyBackgroundColor', JSON.stringify('rgb(0, 0, 128)'));
        localStorage.setItem('iconsColor', JSON.stringify('rgb(200, 200, 200)'));
    }
}

function loadStorageTheme() {
    let storageTheme;
    themes.forEach(theme => {
        if (theme.classList.contains(JSON.parse(localStorage.getItem('themeClass')))) storageTheme = theme;
    })
    if (!JSON.parse(localStorage.getItem('customThemeActive'))) executeChangeTheme(storageTheme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, false);
    else customThemeChanger(JSON.parse(localStorage.getItem('bodyBackgroundColor')), JSON.parse(localStorage.getItem('iconsColor'), false));
}

function colorPicker() {
    $('#color-picker-body').spectrum({
        color: `#${rgbHex(JSON.parse(localStorage.getItem('bodyBackgroundColor')))}`,
        showInput: true,
        showInitial: true,
        showAlpha: true,
        preferredFormat: 'hex'
    });
    $('#color-picker-content').spectrum({
        color: `#${rgbHex(JSON.parse(localStorage.getItem('iconsColor')))}`,
        showInput: true,
        showInitial: true,
        showAlpha: true,
        preferredFormat: 'hex'
    });
    customValueBody = $('#color-picker-body').spectrum('get');
    customValueContent = $('#color-picker-content').spectrum('get');
    $('#color-picker-body').on('change.spectrum', () => {
        customValueBody = $('#color-picker-body').spectrum('get');
    });
    $('#color-picker-content').on('change.spectrum', () => {
        customValueContent = $('#color-picker-content').spectrum('get');
    });
    applyCustomTheme.addEventListener('click', () => {
        if (((timerStarted || pomodorosCount >= 1) && !longBreakTimeSelected) || timerStarted) timerRestartThemeCustom(acceptRestart, declineRestart, themeWarningBackground, customValueBody, customValueContent);
        else {
            customThemeActive = true;
            localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
            customThemeChanger(customValueBody, customValueContent, false);
            if (breakSelected) titleBorderColor(true);
        }
    });
}

function customThemeChanger(bodyValue, contentValue, isTimerStarted) {
    body.setAttribute('style', `background-color: ${bodyValue}; color: ${contentValue};`)
    themeColor.forEach(element => {
        element.setAttribute('style', `color: ${contentValue};`);
    });
    themeBorder.forEach(element => {
        element.setAttribute('style', `border-color: ${contentValue}`);
    });
    if (breakSelected) breakTitle.setAttribute('style', `background: linear-gradient(to right, ${contentValue}, ${contentValue}) no-repeat; background-size: 100% 1.5px; background-position: left bottom`);
    else sessionTitle.setAttribute('style', `background: linear-gradient(to right, ${contentValue}, ${contentValue}) no-repeat; background-size: 100% 1.5px; background-position: left bottom`);
    themeTitle.setAttribute('style', `color: ${contentValue}`);
    pomodoros.forEach(pomodoro => {
        pomodoro.style.borderColor = contentValue;
        if (longBreakTimeSelected && !isTimerStarted) pomodoro.style.backgroundColor = contentValue;
    });
    hideModalSettings(modalSettings, settings);
    bodyBackgroundColor = window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color');
    iconsColor = window.getComputedStyle(sessionTitle).getPropertyValue('color');
    localStorage.setItem('bodyBackgroundColor', JSON.stringify(bodyBackgroundColor));
    localStorage.setItem('iconsColor', JSON.stringify(iconsColor));
}

function removeCustomTheme(fullRemove = false) {
    if (fullRemove) {
        customThemeActive = false;
        localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
    }
    body.style.backgroundColor = '';
    body.style.color = '';
    themeColor.forEach(element => {
        element.style.color = '';
    });
    themeBorder.forEach(element => {
        element.style.borderColor = '';
    });
    breakTitle.style.background = '';
    themeActive.style.background = '';
    themeActive.style.backgroundSize = '';
    themeActive.style.backgroundPosition = '';
    themeTitle.style.color = '';
    pomodoros.forEach(pomodoro => {
        pomodoro.style.borderColor = '';
        pomodoro.style.backgroundColor = '';
    });
}

function timerRestartTheme(accept, decline, themeWarning, theme) {
    themeWarning.style.display = 'block';
    accept.addEventListener('click', () => {
        stopTimerHard(stop, sessionSeconds);
        executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, true);
        if (JSON.parse(localStorage.getItem('customThemeActive'))) {
            removeCustomTheme(true);
        }
        sessionTimeSelected = true;
        breakTimeSelected = false;
        breakSelected = false;
        longBreakTimeSelected = false;
        themeWarning.style.display = 'none';
    });
    decline.addEventListener('click', () => {
        themeWarning.style.display = 'none';
    });
    window.addEventListener('click', function (e) {
        if (e.target === themeWarning) themeWarning.style.display = 'none';
    });
}

function timerRestartThemeCustom(accept, decline, themeWarning, bodyValue, contentValue) {
    themeWarning.style.display = 'block';
    accept.addEventListener('click', () => {
        customThemeActive = true;
        localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
        removeCustomTheme(false);
        stopTimerHard(stop, sessionSeconds);
        sessionTimeSelected = true;
        breakTimeSelected = false;
        breakSelected = false;
        longBreakTimeSelected = false;
        customThemeChanger(bodyValue, contentValue, true);
        titleBorderColor(true)
        themeWarning.style.display = 'none';
    });
    decline.addEventListener('click', () => {
        themeWarning.style.display = 'none';
    });
    window.addEventListener('click', function (e) {
        if (e.target === themeWarning) themeWarning.style.display = 'none';
    });
}

function titleBorderColor(customThemeReset) {
    if (!JSON.parse(localStorage.getItem('customThemeActive')) && !customThemeReset) {
        let currentActive = sessionTitle.classList[sessionTitle.classList.length - 1];
        breakTitle.classList = '';
        breakTitle.classList.add(currentActive);
        sessionTitle.classList = '';
    } else if (customThemeReset) {
        if (breakSelected) customThemeSwitch = false;
        else customThemeSwitch = true;
        sessionTitle.classList = '';
        breakTitle.classList = '';

    }
}

function changeTheme(themes) {
    themes.forEach(theme => {
        theme.addEventListener('click', function () {
            if (((timerStarted || pomodorosCount >= 1) && !longBreakTimeSelected) || timerStarted) timerRestartTheme(acceptRestart, declineRestart, themeWarningBackground, theme);
            else {
                if (JSON.parse(localStorage.getItem('customThemeActive'))) removeCustomTheme(true);
                setTimeout(() => {
                    if (breakSelected) titleBorderColor(false);
                }, 0);
                executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, false);
            }
        });
    });
}

function executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, isTimerStarted) {
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
        pomodoro.classList = '';
        pomodoro.classList.add('pomodoro', `${theme.classList[1]}-border`);
        if (longBreakTimeSelected && !isTimerStarted) pomodoro.classList.add('pomodoro', `${theme.classList[1]}-background`);
    });
    hideModalSettings(modalSettings, settings);
    localStorage.setItem('themeClass', JSON.stringify(document.querySelector('body').classList[0]));
}

function mainThemes() {
    setStorageTheme();
    loadStorageTheme();
    changeTheme(themes);
    colorPicker();
}

window.onload = mainThemes();