// Body
const body = document.querySelector('body');
// Theme
const themes = document.querySelectorAll('.theme');
let themeClass = document.querySelector('body').classList[0];
const themeWarningBackgroundPrebuilt = document.querySelector('#theme-warning-background-prebuilt');
const themeWarningBackgroundCustom = document.querySelector('#theme-warning-background-custom');
// Theme color
const themeColor = document.querySelectorAll('.dark-color');
const themeBackground = document.querySelectorAll('.dark-background');
const themeBorder = document.querySelectorAll('.dark-border');
let themeActive = document.querySelector('.dark-active');
const themeTitle = document.querySelector('.dark-title');
// Current theme name
let currentTheme = body.classList[0];
let newTheme;
let tempNewTheme;
// Restart
const acceptRestartPrebuilt = document.querySelector('#accept-restart-prebuilt');
const declineRestartPrebuilt = document.querySelector('#decline-restart-prebuilt');
const acceptRestartCustom = document.querySelector('#accept-restart-custom');
const declineRestartCustom = document.querySelector('#decline-restart-custom');
// Custom theme
let customValueBody;
let customValueIcons;
let tempCustomValueBody;
let tempCustomValueIcons;
let bodyBackgroundColor = `#${rgbHex(window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color'))}`;
let iconsColor = `#${rgbHex(window.getComputedStyle(sessionTitle).getPropertyValue('color'))}`;
const applyCustomTheme = document.querySelector('#apply-custom-theme');
let customThemeActive = false;
// Tab
const themeColorTab = document.querySelector('meta[name="theme-color"]');

// TODO: Modal should also change color OR make it dark mode (not sure which one is better)
// FIXME: User shouldn't be able to select two colors that are very similar, it'll make the icons invisible

function setStorageTheme() {
    if ((window.localStorage.length === 0 || !localStorage.getItem('themeClass')) &&
        storageAvailable('localStorage')) {
        // Theme
        localStorage.setItem('themeClass', JSON.stringify(themeClass));
        // Custom theme
        localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
        localStorage.setItem('bodyBackgroundColor', JSON.stringify('#202020'));
        localStorage.setItem('iconsColor', JSON.stringify('#e8e8e8'));
        localStorage.setItem('customBodyBackgroundColor', JSON.stringify('#000080'));
        localStorage.setItem('customIconsColor', JSON.stringify('#c8c8c8'));
    }
}

function loadStorageTheme() {
    themes.forEach(theme => {
        if (theme.classList.contains(JSON.parse(localStorage.getItem('themeClass')))) newTheme = theme.getAttribute('data-color');
    })
    if (!JSON.parse(localStorage.getItem('customThemeActive'))) executeChangeTheme(themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, false);
    else {
        customThemeChanger(JSON.parse(localStorage.getItem('customBodyBackgroundColor')), JSON.parse(localStorage.getItem('customIconsColor'), false));
    }
}

/**
 * Sets color picking for Spectrum.
 * Calls and checks application of custom theme.
 * 
 * @return {void}
 */
function colorPicker() {
    $('#color-picker-body').spectrum({
        color: `${JSON.parse(localStorage.getItem('customBodyBackgroundColor'))}`,
        showInput: true,
        showInitial: true,
        showPalette: true,
        showSelectionPalette: true,
        hideAfterPaletteSelect: true,
        maxSelectionSize: 5,
        palette: [],
        localStorageKey: 'customBodyBackgroundColorsList',
        preferredFormat: 'hex'
    });
    $('#color-picker-content').spectrum({
        color: `${JSON.parse(localStorage.getItem('customIconsColor'))}`,
        showInput: true,
        showInitial: true,
        showPalette: true,
        showSelectionPalette: true,
        hideAfterPaletteSelect: true,
        maxSelectionSize: 5,
        palette: [],
        localStorageKey: 'customIconsColorsList',
        preferredFormat: 'hex'
    });
    customValueBody = $('#color-picker-body').spectrum('get');
    customValueIcons = $('#color-picker-content').spectrum('get');
    $('#color-picker-body').on('change.spectrum', () => {
        customValueBody = $('#color-picker-body').spectrum('get');
    });
    $('#color-picker-content').on('change.spectrum', () => {
        customValueIcons = $('#color-picker-content').spectrum('get');
    });
    applyCustomTheme.addEventListener('click', () => {
        if (((timerStarted || pomodorosCount >= 1) && !longBreakTimeSelected) || timerStarted) {
            themeWarningBackgroundCustom.style.display = 'block';
            tempCustomValueBody = customValueBody;
            tempCustomValueIcons = customValueIcons;
        } else {
            customThemeActive = true;
            localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
            customThemeChanger(customValueBody, customValueIcons, false);
            if (breakSelected) titleBorderColor(null, true);
            else if (longBreakTimeSelected) titleBorderColor(null, true);
        }
    });
}

/**
 * Changes the current theme into tone with the selected custom values.
 * 
 * @param {string} bodyValue
 * @param {string} contentValue
 * @param {boolean} isTimerStarted
 * @return {void}
 */
function customThemeChanger(bodyValue, contentValue, isTimerStarted) {
    body.setAttribute('style', `background-color: ${bodyValue}; color: ${contentValue};`)
    themeColor.forEach(element => {
        element.setAttribute('style', `color: ${contentValue};`);
    });
    themeBorder.forEach(element => {
        element.setAttribute('style', `border-color: ${contentValue};`);
    });
    if (breakSelected) breakTitle.setAttribute('style', `background: linear-gradient(to right, ${contentValue}, ${contentValue}) no-repeat; background-size: 100% 1.5px; background-position: left bottom`);
    else if (longBreakTimeSelected) longBreakTitle.setAttribute('style', `background: linear-gradient(to right, ${contentValue}, ${contentValue}) no-repeat; background-size: 100% 1.5px; background-position: left bottom`);
    else sessionTitle.setAttribute('style', `background: linear-gradient(to right, ${contentValue}, ${contentValue}) no-repeat; background-size: 100% 1.5px; background-position: left bottom`);
    themeTitle.setAttribute('style', `color: ${contentValue}`);
    pomodoros.forEach(pomodoro => {
        pomodoro.style.borderColor = contentValue;
        if (longBreakTimeSelected && !isTimerStarted) pomodoro.style.backgroundColor = contentValue;
    });
    hideModalSettings(modalSettings, settings);
    // Update tab and local storage properties
    bodyBackgroundColor = `#${rgbHex(window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color'))}`;
    iconsColor = `#${rgbHex(window.getComputedStyle(sessionTitle).getPropertyValue('color'))}`;
    themeColorTab.setAttribute('content', bodyBackgroundColor);
    localStorage.setItem('customBodyBackgroundColor', JSON.stringify(bodyBackgroundColor));
    localStorage.setItem('customIconsColor', JSON.stringify(iconsColor));
}

/**
 * Removes the current custom theme and applies the new one.
 * On full remove, a pre-built theme is applied.
 * 
 * @return {void}
 */
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
    longBreakTitle.style.background = '';
    themeActive.style.background = '';
    themeActive.style.backgroundSize = '';
    themeActive.style.backgroundPosition = '';
    themeTitle.style.color = '';
    pomodoros.forEach(pomodoro => {
        pomodoro.style.borderColor = '';
        pomodoro.style.backgroundColor = '';
    });
}

/**
 * Asks for a timer restart when a pre-built theme is applied on a timer with progress.
 * 
 * @param {HTMLElement} accept
 * @param {HTMLElement} decline
 * @param {HTMLElement} themeWarning
 * @param {HTMLElement} theme
 * @return {void}
 */
function timerRestartTheme(accept, decline, themeWarning) {
    accept.addEventListener('click', () => {
        stopTimerHard(stop, sessionSeconds);
        newTheme = tempNewTheme;
        executeChangeTheme(themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, true);
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

/**
 * Asks for a timer restart when a custom theme is applied on a timer with progress.
 * 
 * @param {HTMLElement} accept
 * @param {HTMLElement} decline
 * @param {HTMLElement} themeWarning
 * @param {string} bodyValue
 * @param {string} contentValue
 * @return {void}
 */
function timerRestartThemeCustom(accept, decline, themeWarning) {
    accept.addEventListener('click', () => {
        customThemeActive = true;
        localStorage.setItem('customThemeActive', JSON.stringify(customThemeActive));
        removeCustomTheme(false);
        stopTimerHard(stop, sessionSeconds);
        sessionTimeSelected = true;
        breakTimeSelected = false;
        breakSelected = false;
        longBreakTimeSelected = false;
        customValueBody = tempCustomValueBody;
        customValueIcons = tempCustomValueIcons;
        customThemeChanger(customValueBody, customValueIcons, true);
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

/**
 * Correctly switches the color of the border color under the session/break titles.
 * 
 * @param {boolean} customThemeReset 
 * @return {void}
 */
function titleBorderColor(theme, customThemeReset) {
    if (!JSON.parse(localStorage.getItem('customThemeActive')) && !customThemeReset) {
        let currentActive;
        if (sessionTimeSelected) {
            currentActive = `${theme.classList[1]}-active`;
            sessionTitle.classList = '';
            breakTitle.classList = '';
            longBreakTitle.classList = '';
            sessionTitle.classList.add('time-option');
            breakTitle.classList.add('time-option');
            longBreakTitle.classList.add('time-option');
            sessionTitle.classList.add(currentActive);
        } else if (breakTimeSelected) {
            currentActive = `${theme.classList[1]}-active`;
            sessionTitle.classList = '';
            breakTitle.classList = '';
            longBreakTitle.classList = '';
            sessionTitle.classList.add('time-option');
            breakTitle.classList.add('time-option');
            longBreakTitle.classList.add('time-option');
            breakTitle.classList.add(currentActive);
        } else {
            currentActive = `${theme.classList[1]}-active`;
            sessionTitle.classList = '';
            breakTitle.classList = '';
            longBreakTitle.classList = '';
            sessionTitle.classList.add('time-option');
            breakTitle.classList.add('time-option');
            longBreakTitle.classList.add('time-option');
            longBreakTitle.classList.add(currentActive);
        }
    } else if (customThemeReset) {
        if (breakSelected) customThemeSwitch = 'break';
        else if (longBreakTimeSelected) customThemeSwitch = 'long break';
        else customThemeSwitch = 'session';
        sessionTitle.classList = '';
        breakTitle.classList = '';
        longBreakTitle.classList = '';
        sessionTitle.classList.add('time-option');
        breakTitle.classList.add('time-option');
        longBreakTitle.classList.add('time-option');
    }
}

/**
 * Sets picking for pre-built themes.
 * Calls and checks application od custom theme.
 * 
 * @param {HTMLElement} themes 
 * @return {void}
 */
function changeTheme(themes) {
    themes.forEach(theme => {
        theme.addEventListener('click', function () {
            if (((timerStarted || pomodorosCount >= 1) && !longBreakTimeSelected) || timerStarted) {
                themeWarningBackgroundPrebuilt.style.display = 'block';
                tempNewTheme = theme.getAttribute('data-color');
            } else {
                if (JSON.parse(localStorage.getItem('customThemeActive'))) removeCustomTheme(true);
                setTimeout(() => {
                    if (breakSelected) titleBorderColor(theme, false);
                    else if (longBreakTimeSelected) titleBorderColor(theme, false);
                }, 0);
                newTheme = theme.getAttribute('data-color');
                executeChangeTheme(themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, false);
            }
        });
    });
}

/**
 * Changes current theme into the selected pre-built theme.
 * Uses class switching to achieve this.
 * 
 * @param {HTMLElement} theme
 * @param {HTMLElement} themeColor
 * @param {HTMLElement} themeBorder
 * @param {HTMLElement} themeActive
 * @param {HTMLElement} themeTitle
 * @param {HTMLElements} pomodoros
 * @param {HTMLElement} modalSettings
 * @param {boolean} isTimerStarted
 * @return {void}
 */
function executeChangeTheme(themeColor, themeBorder, themeActive, themeTitle, pomodoros, modalSettings, isTimerStarted) {
    body.classList = '';
    body.classList.add(newTheme);
    themeColor.forEach(element => {
        element.classList.remove(`${currentTheme}-color`);
        element.classList.add(`${newTheme}-color`);
    });
    themeBorder.forEach(element => {
        element.classList.remove(`${currentTheme}-border`);
        element.classList.add(`${newTheme}-border`);
    });
    themeActive.classList.remove(`${currentTheme}-active`);
    themeActive.classList.add(`${newTheme}-active`);
    themeActive = document.querySelector(`.${newTheme}-active`);
    themeTitle.classList.remove(`${currentTheme}-title`);
    themeTitle.classList.add(`${newTheme}-title`);
    pomodoros.forEach(pomodoro => {
        pomodoro.classList = '';
        pomodoro.classList.add('pomodoro', `${newTheme}-border`);
        if (longBreakTimeSelected && !isTimerStarted) pomodoro.classList.add('pomodoro', `${newTheme}-background`);
    });
    hideModalSettings(modalSettings, settings);
    // Update theme variables
    currentTheme = body.classList[0];
    // Update tab and local storage properties
    setTimeout(() => {
        bodyBackgroundColor = `#${rgbHex(window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color'))}`;
        iconsColor = `#${rgbHex(window.getComputedStyle(sessionTitle).getPropertyValue('color'))}`;
        themeColorTab.setAttribute('content', bodyBackgroundColor);
        localStorage.setItem('themeClass', JSON.stringify(document.querySelector('body').classList[0]));
        localStorage.setItem('bodyBackgroundColor', JSON.stringify(bodyBackgroundColor));
        localStorage.setItem('iconsColor', JSON.stringify(iconsColor));
    }, 0);
}

function mainThemes() {
    // Storage
    setStorageTheme();
    loadStorageTheme();
    // Timer restart warnings
    timerRestartTheme(acceptRestartPrebuilt, declineRestartPrebuilt, themeWarningBackgroundPrebuilt);
    timerRestartThemeCustom(acceptRestartCustom, declineRestartCustom, themeWarningBackgroundCustom);
    // Theme changing
    changeTheme(themes);
    colorPicker();
}

window.onload = mainThemes();