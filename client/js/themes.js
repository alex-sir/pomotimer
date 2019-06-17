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
let customValueBody;
let customValueContent;
const applyCustomTheme = document.querySelector('#apply-custom-theme');
let customThemeActive = false;

function colorPicker() {
    $('#color-picker-body').spectrum({
        color: '#000080',
        showInput: true,
        showInitial: true,
        showAlpha: true,
        preferredFormat: 'hex'
    });
    $('#color-picker-content').spectrum({
        color: '#C8C8C8',
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
}

function removeCustomTheme(fullRemove = false) {
    if (fullRemove) customThemeActive = false;
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
        if (customThemeActive) {
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

function changeTheme(themes) {
    themes.forEach(theme => {
        theme.addEventListener('click', function () {
            if (((timerStarted || pomodorosCount >= 1) && !longBreakTimeSelected) || timerStarted) timerRestartTheme(acceptRestart, declineRestart, themeWarningBackground, theme);
            else {
                if (customThemeActive) removeCustomTheme(true);
                setTimeout(() => {
                    if (breakSelected) titleBorderColor(false);
                }, 0);
                executeChangeTheme(theme, themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, false);
            }
        });
    });
}

function titleBorderColor(customThemeReset) {
    if (!customThemeActive && !customThemeReset) {
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
}

function mainThemes() {
    changeTheme(themes);
    colorPicker();
}

window.onload = mainThemes();