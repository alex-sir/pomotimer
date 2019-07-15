// Timer
let countdown;
const timer = document.querySelector('#timer');
let timerStarted = false;
// Timer controls
const playPause = document.querySelector('#play-pause');
const playPauseIcon = document.querySelector('#play-pause>.la');
let isPaused = true;
const stop = document.querySelector('#stop');
const reset = document.querySelector('#reset');
// Pomodoros
const pomodoros = document.querySelectorAll('.pomodoro');
let pomodorosCount = 0;
// Session
const sessionTitle = document.querySelector('.session-title h3');
const sessionMinutes = document.querySelector('#session-minutes');
// Break
const breakTitle = document.querySelector('.break-title h3');
const breakMinutes = document.querySelector('#break-minutes');
// Long break
const longBreakTitle = document.querySelector('.long-break-title h3');
const longBreakMinutes = document.querySelector('#long-break-minutes');
let longBreak = 15;
const longBreakPomodoro = document.querySelector('.pomodoro:last-of-type');
const longBreakInput = document.querySelector('#long-break-input');
const confirmTimeChangeLongBreak = document.querySelector('.confirm-time-change-long-break');
const timeInputLabelLongBreak = document.querySelector('.time-input-wrapper:last-child>label');
// Current seconds
let sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
// Preferences
const preferences = document.querySelectorAll('.preference');
const autoStart = document.querySelector('#auto-start');
const notifications = document.querySelector('#notifications');
const tabTitleTime = document.querySelector('#tab-title-time');
const breakLongBreakLink = document.querySelector('#break-long-break-link');
const fullscreen = document.querySelector('#fullscreen-toggle');
const zenModeToggle = document.querySelector('#zen-mode');
// Selections
let breakSelected = false;
let sessionTimeSelected = true;
let breakTimeSelected = false;
let longBreakTimeSelected = false;
let customThemeSwitch = 'session';
let currentActive;
// Time inputs
const timeInputs = document.querySelectorAll('.time-input');
const timeInputLabels = document.querySelectorAll('.time-input-wrapper>label');
const sessionInput = document.querySelector('#session-input');
const breakInput = document.querySelector('#break-input');
const confirmTimeChanges = document.querySelectorAll('.confirm-time-change');
const confirmTimeChangeSession = document.querySelector('.confirm-time-change-session');
const confirmTimeChangeBreak = document.querySelector('.confirm-time-change-break');
// Notifications
const notificationIcon = 'assets/favicon/android-chrome-192x192.png';
const notificationTime = 5000;
// Sound
let notificationSound = new Audio('assets/sound/blithe.mp3');
const optionsNotificationSound = document.querySelector('#notification-sound-select');
const playNotificationSound = document.querySelector('.test-sound')
// Zen Mode
let timerElements = document.querySelectorAll('main *:not(#timer):not(.timer-display)');
let navElements = document.querySelectorAll('.zen-element');
let mainHeader = document.querySelector('.main-header');
const transitionTime = 0.4;
// Zen Mode Header Bottom Border
let headerBottomBorder = window.getComputedStyle(document.querySelector('.main-header')).borderBottom;
let tempHeaderBottomBorder = rgbHex(headerBottomBorder.substring(10, headerBottomBorder.length));
headerBottomBorder = hexToRgba(`#${tempHeaderBottomBorder}`, '0.4');
// Zen Mode Opacity Sections
const nav = document.querySelector('nav');
const timeOptions = document.querySelectorAll('.time-option');
const timerControls = document.querySelector('.timer-controls');
const timerControlsElements = document.querySelectorAll('.timer-controls *');
const pomodoroContainer = document.querySelector('.pomodoro-container');
const pomodoroContainerElements = document.querySelectorAll('.pomodoro-container *');

// TODO: Add statistics showing pomodoro completions and progress
// TODO: Use map for logging localStorage to keep consistency
// TODO: Add a "move to middle" option to move the timer and controls to the middle of the screen. Useful for screens in fullscreen.
// TODO: Add a "time and pomodoros only" option, where all other icons are gone except for the time display and pomodoros.
// TODO: Add a "fade on play" option where everything but the time fades
// TODO: Add a to-do list under the timer. It should feature the ability to add, delete, tag, and be expandable with more info (a description)
// FIXME: Delay in time for tab title. Use web workers to solve this
// FIXME: Notifications don't pop up on mobile

/**
 * https://mzl.la/2zJOaCZ
 * 
 * @param {string} type 
 * @return {boolean}
 */
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function setStorage() {
    if (window.localStorage.length === 0 && storageAvailable('localStorage')) {
        // Time
        localStorage.setItem('session', JSON.stringify(sessionMinutes.textContent));
        localStorage.setItem('break', JSON.stringify(breakMinutes.textContent));
        localStorage.setItem('longBreak', JSON.stringify(longBreak));
        // Preferences
        localStorage.setItem('autoStart', JSON.stringify(true));
        autoStart.checked = true;
        localStorage.setItem('notifications', JSON.stringify(false));
        notifications.checked = false;
        localStorage.setItem('tabTitleTime', JSON.stringify(true));
        tabTitleTime.checked = true;
        localStorage.setItem('breakLongBreakLink', JSON.stringify(true));
        breakLongBreakLink.checked = true;
        localStorage.setItem('zenMode', JSON.stringify(true));
        zenModeToggle.checked = true;
        // Sound
        localStorage.setItem('notificationSound', JSON.stringify(optionsNotificationSound.value));
    }
}

function setStorageTime() {
    localStorage.setItem('session', JSON.stringify(sessionMinutes.textContent));
    localStorage.setItem('break', JSON.stringify(breakMinutes.textContent));
    localStorage.setItem('longBreak', JSON.stringify(longBreak));
}

function setStoragePreferences() {
    preferences.forEach(preference => {
        preference.addEventListener('change', () => {
            localStorage.setItem(preference.getAttribute('data-preference'), JSON.stringify(preference.checked));
        });
    });
}

/**
 * Checks seconds to see if the timer font needs adjusting. Adjusts it if so.
 * 
 * @param {number} seconds
 * @param {HTMLElement} timer
 * @return {void}
 */
function checkTimerFont(seconds, timer) {
    if (seconds === 360000 && window.matchMedia('(max-width: 420px)').matches) {
        timer.style.fontSize = '4.5rem';
        timer.setAttribute('style', 'font-size: 5rem; margin: 24px 0;');
    } else if (seconds >= 3600 && window.matchMedia('(max-width: 420px)').matches) {
        timer.style.fontSize = '5rem';
        timer.setAttribute('style', 'font-size: 5rem; margin: 24px 0;');
    } else if (window.matchMedia('(max-width: 420px)').matches) {
        timer.setAttribute('style', 'font-size: 8rem;');
    }
}

function loadStorage() {
    // Session
    sessionMinutes.textContent = JSON.parse(localStorage.getItem('session'));
    sessionInput.setAttribute('value', JSON.parse(localStorage.getItem('session')));
    sessionSeconds = +sessionMinutes.textContent * 60;
    displayTimeLeft(sessionSeconds, false);
    // Break
    breakMinutes.textContent = JSON.parse(localStorage.getItem('break'));
    breakInput.setAttribute('value', JSON.parse(localStorage.getItem('break')));
    // Long Break
    longBreak = JSON.parse(localStorage.getItem('longBreak'));
    longBreakInput.setAttribute('value', longBreak);
    longBreakMinutes.textContent = longBreak;
    // Preferences
    autoStart.checked = JSON.parse(localStorage.getItem('autoStart'));
    notifications.checked = JSON.parse(localStorage.getItem('notifications'));
    tabTitleTime.checked = JSON.parse(localStorage.getItem('tabTitleTime'));
    breakLongBreakLink.checked = JSON.parse(localStorage.getItem('breakLongBreakLink'));
    breakLongBreakLinkCheck(breakLongBreakLink, longBreakInput, confirmTimeChangeLongBreak, timeInputLabelLongBreak, breakMinutes, true)(breakLongBreakLink);
    zenModeToggle.checked = JSON.parse(localStorage.getItem('zenMode'));
    // Sound
    optionsNotificationSound.value = JSON.parse(localStorage.getItem('notificationSound'));
    if (optionsNotificationSound.value === 'none') {
        notificationSound = new Audio();
    } else {
        notificationSound = new Audio(`assets/sound/${optionsNotificationSound.value}.mp3`);
    }
    // Timer font
    checkTimerFont(sessionSeconds, timer);
}

function clearStorage() {
    const clearStorage = document.querySelector('#clear-storage');
    const storageWarningBackground = document.querySelector('.storage-warning-background');
    const acceptClear = document.querySelector('#accept-clear');
    const declineClear = document.querySelector('#decline-clear');

    clearStorage.addEventListener('click', () => {
        storageWarningBackground.style.display = 'block';
        acceptClear.addEventListener('click', () => {
            localStorage.clear();
            storageWarningBackground.style.display = 'none';
            location.reload(true);
        });
        declineClear.addEventListener('click', () => {
            storageWarningBackground.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === storageWarningBackground) storageWarningBackground.style.display = 'none';
        });
    });
}

function logStorage() {
    const logStorage = document.querySelector('#log-storage');
    const storageLogWrapper = document.querySelector('.storage-log-wrapper');
    const closeBtnLog = document.querySelector('#close-btn-log');
    const storageLogContent = document.querySelector('#storage-log-content');

    logStorage.addEventListener('click', () => {
        storageLogWrapper.style.display = 'block';
        for (let [key, value] of Object.entries(localStorage)) {
            let localStorageProperty = document.createElement('div');
            localStorageProperty.textContent = `${key}: ${value}`;
            localStorageProperty.style.marginBottom = '10px';
            storageLogContent.appendChild(localStorageProperty);
        }
        document.querySelector('#storage-log-content>div:last-child').style.marginBottom = '0';
    });

    function hideLogModal() {
        storageLogWrapper.style.display = 'none';
        storageLogContent.textContent = '';
    }

    closeBtnLog.addEventListener('click', () => {
        hideLogModal();
    });
    window.addEventListener('click', e => {
        if (e.target === storageLogWrapper) {
            hideLogModal();
        }
    });
}

function togglePlayPause(icon) {
    icon.classList.toggle('la-play');
    icon.classList.toggle('la-pause');
}

// Zen Mode Opacity
function fullOpacity() {
    function activateFullOpacity(container, containerElements) {
        container.style.opacity = '1';
        containerElements.forEach(element => {
            element.style.opacity = '1';
        });
    }
    if (this.classList.contains('timer-controls')) {
        timerControls.style.opacity = '1';
        timerControlsElements.forEach(element => {
            if (element.classList.contains('btn-time')) {
                element.style.removeProperty('transition');
                element.style.removeProperty('opacity');
            } else {
                element.style.opacity = '1';
            }
        });
    } else if (this.classList.contains('pomodoro-container')) {
        activateFullOpacity(pomodoroContainer, pomodoroContainerElements);
    } else if (this.classList.contains('main-nav')) {
        activateFullOpacity(nav, navElements);
    } else if (this.classList.contains('time-option')) {
        timeOptions.forEach(timeOption => {
            if (timeOption.tagName === 'H3') {
                timeOption.style.removeProperty('transition');
                timeOption.style.removeProperty('opacity');
            } else {
                timeOption.style.opacity = '1';
            }
        });
    }
}

function lessOpacity() {
    function activateLessOpacity(container, containerElements) {
        container.style.opacity = '0.6';
        containerElements.forEach(element => {
            element.style.opacity = '0.6';
        });
    }
    if (this.classList.contains('timer-controls')) {
        activateLessOpacity(timerControls, timerControlsElements);
    } else if (this.classList.contains('pomodoro-container')) {
        activateLessOpacity(pomodoroContainer, pomodoroContainerElements);
    } else if (this.classList.contains('main-nav')) {
        activateLessOpacity(nav, navElements);
    } else if (this.classList.contains('time-option')) {
        timeOptions.forEach(timeOption => {
            timeOption.style.opacity = '0.6';
        });
    }
}

function zenMode(returnDeactivate) {
    timerElements = document.querySelectorAll('main *:not(#timer):not(.timer-display)');
    navElements = document.querySelectorAll('.zen-element');
    mainHeader = document.querySelector('.main-header');
    headerBottomBorder = window.getComputedStyle(document.querySelector('.main-header')).borderBottom;
    tempHeaderBottomBorder = rgbHex(headerBottomBorder.substring(10, headerBottomBorder.length));
    headerBottomBorder = hexToRgba(`#${tempHeaderBottomBorder}`, '0.4');

    function activateZenMode() {
        timerElements.forEach(element => {
            if (element.tagName === 'H3' || element.classList.contains('pomodoro')) {
                element.style.transition = `opacity ${transitionTime}s ease-in-out`;
                element.style.opacity = '0.6';
            } else {
                element.setAttribute('style', `opacity 1; transition: opacity ${transitionTime}s ease-in-out;`);
                element.style.opacity = '0.6';
            }
        });
        navElements.forEach(element => {
            element.setAttribute('style', `opacity 1; transition: opacity ${transitionTime}s ease-in-out;`);
            element.style.opacity = '0.4';
        });
        mainHeader.setAttribute('style', `transition: border-color ${transitionTime}s ease-in-out;`);
        mainHeader.style.borderColor = headerBottomBorder;
        nav.setAttribute('style', `transition: opacity ${transitionTime}s ease-in-out;`);
        // Section opacity listeners
        timerControls.addEventListener('mouseover', fullOpacity, false);
        timerControls.addEventListener('mouseout', lessOpacity, false);
        pomodoroContainer.addEventListener('mouseover', fullOpacity, false);
        pomodoroContainer.addEventListener('mouseout', lessOpacity, false);
        nav.addEventListener('mouseover', fullOpacity, false);
        nav.addEventListener('mouseout', lessOpacity, false);
        timeOptions.forEach(timeOption => {
            timeOption.addEventListener('mouseover', fullOpacity, false);
            timeOption.addEventListener('mouseout', lessOpacity, false);
        });
    }

    function deactivateZenMode() {
        timerElements.forEach(element => {
            element.style.opacity = '1';
            setTimeout(() => {
                if (customThemeSwitch === 'session' ||
                    customThemeSwitch === 'break' ||
                    customThemeSwitch === 'long break') {
                    if (!(element.textContent === 'Session') &&
                        !(element.textContent === 'Break') &&
                        !(element.textContent === 'Respite') &&
                        !(element.classList.contains('pomodoro'))) {
                        element.setAttribute('style', '');
                    } else {
                        element.style.removeProperty('transition');
                        element.style.removeProperty('opacity');
                    }
                }
            }, transitionTime * 1000);
        });
        navElements.forEach(element => {
            element.style.opacity = '1';
            setTimeout(() => {
                element.setAttribute('style', '');
            }, transitionTime * 1000);
        });
        mainHeader.style.borderColor = hexToRgba(`#${tempHeaderBottomBorder}`, '1');
        nav.style.opacity = '1';
        // Section opacity listeners
        timerControls.removeEventListener('mouseover', fullOpacity, false);
        timerControls.removeEventListener('mouseout', lessOpacity, false);
        pomodoroContainer.removeEventListener('mouseover', fullOpacity, false);
        pomodoroContainer.removeEventListener('mouseout', lessOpacity, false);
        nav.removeEventListener('mouseover', fullOpacity, false);
        nav.removeEventListener('mouseout', lessOpacity, false);
        timeOptions.forEach(timeOption => {
            timeOption.removeEventListener('mouseover', fullOpacity, false);
            timeOption.removeEventListener('mouseout', lessOpacity, false);
        });
        setTimeout(() => {
            mainHeader.setAttribute('style', '');
            nav.setAttribute('style', '');
        }, transitionTime * 1000);
    }

    if (returnDeactivate) return deactivateZenMode;

    if (playPauseIcon.classList.contains('la-pause')) {
        activateZenMode();
    } else {
        deactivateZenMode();
    }
}

function zenModePomodoroFinished() {
    pomodoroContainer.style.opacity = '1';
    pomodoroContainerElements.forEach(element => {
        element.style.opacity = '1';
    });
    setTimeout(() => {
        pomodoroContainerElements.forEach(element => {
            element.style.opacity = '0.6';
        });
        pomodoroContainer.style.opacity = '0.6';
    }, 2000);
}

/**
 * Runs core logic for displaying and counting down the timer.
 * 
 * @param {number} seconds
 * @param {boolean} breakTime
 * @param {boolean} returnRunTimerDisplay
 * @return {function || void}
 */
function timerDisplay(seconds, breakTime = true, returnRunTimerDisplay) {
    function runTimerDisplay() {
        if (!timerStarted) timerStarted = true;
        if (breakSelected && pomodorosCount !== 4 && !timerStarted) sessionSeconds = breakMinutes.textContent * 60;
        seconds = sessionSeconds;
        clearInterval(countdown);
        isPaused = false;
        // Disable time inputs and buttons while timer is running
        autoStart.disabled = true;
        breakLongBreakLink.disabled = true;
        zenModeToggle.disabled = true;
        for (let i = 0; i < timeInputs.length; i++) {
            if (timeInputs[i].id === 'long-break-input' && breakLongBreakLink.checked) null;
            else {
                timeInputs[i].disabled = true;
                timeInputs[i].classList.add('line-through-long-break', 'opacity-long-break');
            }
            if (confirmTimeChanges[i].classList.contains('confirm-time-change-long-break') && breakLongBreakLink.checked) null;
            else {
                confirmTimeChanges[i].style.pointerEvents = 'none';
                confirmTimeChanges[i].classList.add('opacity-long-break', 'pointer-events-long-break');
            }
            if (timeInputLabels[i].getAttribute('for') === 'long-break-input' && breakLongBreakLink.checked) null;
            else timeInputLabels[i].classList.add('line-through-long-break', 'opacity-long-break');
        }
        const now = Date.now();
        const then = now + seconds * 1000;
        displayTimeLeft(seconds);

        countdown = setInterval(() => {
            const secondsLeft = Math.round((then - Date.now()) / 1000);
            // const secondsLeft = Math.round((then - then) / 1000);
            sessionSeconds -= 1;

            if (secondsLeft < 1) {
                clearInterval(countdown);
                if (autoStart.checked) {
                    if (pomodorosCount === 4) {
                        if (customThemeActive) {
                            customThemeSwitch = 'session';
                            titleBorderChange(false, false, false, false);
                        } else {
                            currentActive = titleBorderChange(true, false, false, false);
                        }
                        try {
                            if (Notification.permission === 'granted') {
                                const notificationLongBreakOver = new Notification('Respite over', {
                                    icon: notificationIcon,
                                    body: 'Session started'
                                });
                                notificationSound.play();
                                setTimeout(notificationLongBreakOver.close.bind(notificationLongBreakOver), notificationTime);
                            }
                        } catch (e) {
                            // console.error(e);
                            null;
                        }
                        breakSelected = false;
                        breakTimeSelected = true;
                        sessionTimeSelected = false;
                        longBreakTimeSelected = false;
                        pomodorosCount = 0;
                        // Reset pomodoros to correct colors
                        pomodoros.forEach((pomodoro) => {
                            if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoro.classList.remove(`${currentActive.split('-')[0]}-background`);
                            else pomodoro.setAttribute('style', `background-color: ${customValueBody}; border-color: ${customValueIcons};`);
                        });
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, true, true)();
                    } else if (breakTime && !breakSelected) {
                        // Session finishes, start break or long break
                        breakSelected = true;
                        breakTimeSelected = true;
                        sessionTimeSelected = false;
                        pomodorosCount++;
                        if (pomodorosCount === 4) {
                            sessionSeconds = Math.min(longBreak * 60, 6000);
                            if (customThemeActive) {
                                customThemeSwitch = 'long break';
                                titleBorderChange(false, false, false, false);
                            } else {
                                currentActive = titleBorderChange(false, false, true, false);
                            }
                            try {
                                if (Notification.permission === 'granted') {
                                    const notificationLongBreakStart = new Notification('Session over', {
                                        icon: notificationIcon,
                                        body: 'Respite started'
                                    });
                                    notificationSound.play();
                                    setTimeout(notificationLongBreakStart.close.bind(notificationLongBreakStart), notificationTime);
                                }
                            } catch (e) {
                                // console.error(e);
                                null;
                            }
                            longBreakTimeSelected = true;
                        } else {
                            sessionSeconds = parseInt(breakMinutes.textContent) * 60;
                            if (customThemeActive) {
                                customThemeSwitch = 'break';
                                titleBorderChange(false, false, false, false);
                            } else {
                                currentActive = titleBorderChange(false, true, false, false);
                            }
                            try {
                                if (Notification.permission === 'granted') {
                                    const notificationBreakStart = new Notification('Session over', {
                                        icon: notificationIcon,
                                        body: 'Break started'
                                    });
                                    notificationSound.play();
                                    setTimeout(notificationBreakStart.close.bind(notificationBreakStart), notificationTime);
                                }
                            } catch (e) {
                                // console.error(e);
                                null;
                            }
                        }
                        if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoros[pomodorosCount - 1].classList.add(`${currentActive.split('-')[0]}-background`);
                        else pomodoros[pomodorosCount - 1].setAttribute('style', `background-color: ${customValueIcons}; border-color: ${customValueIcons};`);
                        timerDisplay(sessionSeconds, false, true)();
                        pomodoroContainerElements.forEach(element => {
                            element.style.opacity = 1;
                        });
                    } else {
                        if (customThemeActive) {
                            customThemeSwitch = 'session';
                            titleBorderChange(false, false, false, false);
                        } else {
                            currentActive = titleBorderChange(true, false, false, false);
                        }
                        try {
                            if (Notification.permission === 'granted') {
                                const notificationBreakOver = new Notification('Break over', {
                                    icon: notificationIcon,
                                    body: 'Session started'
                                });
                                notificationSound.play();
                                setTimeout(notificationBreakOver.close.bind(notificationBreakOver), notificationTime);
                            }
                        } catch (e) {
                            // console.error(e);
                            null;
                        }
                        breakSelected = false;
                        breakTimeSelected = false;
                        sessionTimeSelected = true;
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, true, true)();
                    }
                    if (zenModeToggle.checked) zenModePomodoroFinished();
                } else {
                    try {
                        if (Notification.permission === 'granted') {
                            const notificationTimeOver = new Notification('Time over', {
                                icon: notificationIcon,
                            });
                            notificationSound.play();
                            setTimeout(notificationTimeOver.close.bind(notificationTimeOver), notificationTime);
                        }
                    } catch (e) {
                        // console.error(e);
                        null;
                    }
                }
            }
            displayTimeLeft(secondsLeft);
        }, 1000);
    }
    if (returnRunTimerDisplay) return runTimerDisplay;
    document.addEventListener('keydown', e => {
        if (e.keyCode === 32 &&
            (document.activeElement === body)) {
            if (e.repeat) return;
            if (isPaused) runTimerDisplay();
            else pauseTimer(false)();
            togglePlayPause(playPauseIcon);
            if (zenModeToggle.checked) zenMode(false);
        }
    });
    playPause.addEventListener('click', () => {
        if (isPaused) runTimerDisplay();
        else pauseTimer(false)();
        togglePlayPause(playPauseIcon);
        if (zenModeToggle.checked) zenMode(false);
    });
}

/**
 * Allows selection of a session, break, or long break.
 * Displays correct time and selection.
 * 
 * @param {HTMLElement} sessionTime
 * @param {HTMLElement} breakTime
 * @param {HTMLElement} longBreakPomodoro
 * @return {void}
 */
function sessionBreakSelect(sessionTime, breakTime, longBreakTime) {
    function runSessionSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        if (sessionSeconds === longBreak * 60) resetPomodoros(pomodoros);
        sessionTime.blur();
        breakSelected = false;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        pomodorosCount = 0;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, true, true);
        if (sessionTimeSelected) null;
        else if (breakTimeSelected || longBreakTimeSelected) {
            breakTimeSelected = false;
            longBreakTimeSelected = false;
            sessionTimeSelected = true;
            customThemeSwitch = 'session';
            titleBorderChange(true, false, false, false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    function runBreakSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        if (sessionSeconds === longBreak * 60) resetPomodoros(pomodoros);
        breakTime.blur();
        breakSelected = true;
        sessionSeconds = parseInt(breakMinutes.textContent) * 60;
        pomodorosCount = 0;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false, true);
        if (breakTimeSelected) null;
        else if (sessionTimeSelected || longBreakTimeSelected) {
            sessionTimeSelected = false;
            longBreakTimeSelected = false;
            breakTimeSelected = true;
            customThemeSwitch = 'break';
            titleBorderChange(false, true, false, false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    function runLongBreakSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        longBreakTime.blur();
        breakSelected = false;
        sessionSeconds = parseInt(longBreakMinutes.textContent) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false, true);
        let currentActive = titleBorderChange(false, false, false, true);
        pomodorosCount = 4;
        // Fill in all four pomodoros
        pomodoros.forEach(pomodoro => {
            if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoro.classList.add(`${currentActive.split('-')[0]}-background`);
            else pomodoro.setAttribute('style', `background-color: ${customValueIcons}; border-color: ${customValueIcons};`);
        });
        if (longBreakTimeSelected) null;
        else if (sessionTimeSelected || breakTimeSelected) {
            longBreakTimeSelected = true;
            breakTimeSelected = false;
            sessionTimeSelected = false;
            customThemeSwitch = 'long break';
            titleBorderChange(false, false, true, false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    document.addEventListener('keydown', e => {
        if ((e.altKey && e.keyCode === 80) ||
            (document.activeElement === sessionTitle && e.keyCode === 32) ||
            (document.activeElement === sessionTitle && e.keyCode === 13)) {
            if (e.repeat) return
            runSessionSelect();
        }
    });
    sessionTime.addEventListener('click', runSessionSelect);
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 66 ||
            (document.activeElement === breakTitle && e.keyCode === 32) ||
            (document.activeElement === breakTitle && e.keyCode === 13)) {
            if (e.repeat) return
            runBreakSelect();
        }
    });
    breakTime.addEventListener('click', runBreakSelect);
    longBreakTime.addEventListener('click', runLongBreakSelect)
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 76 ||
            (document.activeElement === longBreakTitle && e.keyCode === 32) ||
            (document.activeElement === longBreakTitle && e.keyCode === 13)) {
            if (e.repeat) return;
            runLongBreakSelect();
        }
    });
}

/**
 * Changes border under session or select.
 * Adjusts colors and classes as needed.
 * 
 * @param {boolean} noTitleToggle
 * @return {DOM class || void}
 */
function titleBorderChange(isSession, isBreak, isLongBreak, getCurrentActive) {
    let currentActive;
    if (!JSON.parse(localStorage.getItem('customThemeActive'))) {
        if (sessionTitle.classList.length >= 2) {
            currentActive = sessionTitle.classList[sessionTitle.classList.length - 1];
            if (getCurrentActive) return currentActive;
            sessionTitle.classList.toggle(currentActive);
            if (isBreak) breakTitle.classList.toggle(currentActive);
            if (isLongBreak) longBreakTitle.classList.toggle(currentActive);
        } else if (breakTitle.classList.length >= 2) {
            currentActive = breakTitle.classList[breakTitle.classList.length - 1];
            if (getCurrentActive) return currentActive;
            breakTitle.classList.toggle(currentActive);
            if (isSession) sessionTitle.classList.toggle(currentActive);
            if (isLongBreak) longBreakTitle.classList.toggle(currentActive);
        } else {
            currentActive = longBreakTitle.classList[longBreakTitle.classList.length - 1];
            if (getCurrentActive) return currentActive;
            longBreakTitle.classList.toggle(currentActive);
            if (isSession) sessionTitle.classList.toggle(currentActive);
            if (isBreak) breakTitle.classList.toggle(currentActive);
        }
        return currentActive;
    } else {
        sessionTitle.classList = '';
        breakTitle.classList = '';
        longBreakTitle.classList = '';
        sessionTitle.classList.add('time-option');
        breakTitle.classList.add('time-option');
        longBreakTitle.classList.add('time-option');
        if (customThemeSwitch === 'break') {
            sessionTitle.style.background = '';
            sessionTitle.style.backgroundSize = '';
            sessionTitle.style.backgroundPosition = '';
            longBreakTitle.style.background = '';
            longBreakTitle.style.backgroundSize = '';
            longBreakTitle.style.backgroundPosition = '';
            breakTitle.style.background = `linear-gradient(to right, ${customValueIcons}, ${customValueIcons}) no-repeat`;
            breakTitle.style.backgroundSize = 'var(--pomodoro-size)';
            breakTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        } else if (customThemeSwitch === 'long break') {
            sessionTitle.style.background = '';
            sessionTitle.style.backgroundSize = '';
            sessionTitle.style.backgroundPosition = '';
            breakTitle.style.background = '';
            breakTitle.style.backgroundSize = '';
            breakTitle.style.backgroundPosition = '';
            longBreakTitle.style.background = `linear-gradient(to right, ${customValueIcons}, ${customValueIcons}) no-repeat`;
            longBreakTitle.style.backgroundSize = 'var(--pomodoro-size)';
            longBreakTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        } else {
            breakTitle.style.background = '';
            breakTitle.style.backgroundSize = '';
            breakTitle.style.backgroundPosition = '';
            longBreakTitle.style.background = '';
            longBreakTitle.style.backgroundSize = '';
            longBreakTitle.style.backgroundPosition = '';
            sessionTitle.style.background = `linear-gradient(to right, ${customValueIcons}, ${customValueIcons}) no-repeat`;
            sessionTitle.style.backgroundSize = 'var(--pomodoro-size)';
            sessionTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        }
        return;
    }
}

/**
 * @param {number} seconds
 * @param {boolean} title
 * @return {void}
 */
function displayTimeLeft(seconds, title = true) {
    let minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    let display;
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        minutes %= 60;
        display = `${hours < 10 ? hours.toString().padStart(2, 0) : hours}:${
            minutes < 10 ? minutes.toString().padStart(2, 0) : minutes}:${
            remainderSeconds < 10 ? remainderSeconds.toString().padStart(2, 0) : remainderSeconds}`;
    } else {
        display = `${minutes < 10 ? minutes.toString().padStart(2, 0) : minutes}:${
            remainderSeconds < 10 ? remainderSeconds.toString().padStart(2, 0) : remainderSeconds}`;
    }
    timer.textContent = display;
    if (!title || !tabTitleTime.checked) return;
    else document.title = `(${display}) Pomodoro`;
}

/**
 * @param {HTMLElement} pause
 * @param {boolean} clickRun
 * @return {function || void}
 */
function pauseTimer(clickRun) {
    function runPauseTimer() {
        clearInterval(countdown);
        // Resume timer for session or break
        sessionTitle.classList >= 1 ? timerDisplay(0, true, true) : timerDisplay(0, false, true);
        isPaused = true;
    }

    if (!clickRun) return runPauseTimer;
    else {
        isPaused = true;
    }
}

/**
 * On timer reset, move bottom border indicator to session.
 * 
 * @return {void}
 */
function breakSessionTitleReset() {
    if (breakTitle.classList.length >= 2) {
        sessionTitle.classList.add(breakTitle.classList[breakTitle.classList.length - 1]);
        breakTitle.classList = '';
        breakTitle.classList.add('time-option');
    } else if (longBreakTitle.classList.length >= 2) {
        sessionTitle.classList.add(longBreakTitle.classList[longBreakTitle.classList.length - 1]);
        longBreakTitle.classList = '';
        longBreakTitle.classList.add('time-option');
    } else if (JSON.parse(localStorage.getItem('customThemeActive'))) {
        sessionTitle.style.background = `linear-gradient(to right, ${customValueIcons}, ${customValueIcons}) no-repeat`;
        sessionTitle.style.backgroundSize = 'var(--pomodoro-size)';
        sessionTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        breakTitle.style.background = '';
        longBreakTitle.style.background = '';
        customThemeSwitch = 'session';
    }
}

/**
 * @return {void}
 */
function enableTimeInputs() {
    for (let i = 0; i < timeInputs.length; i++) {
        if (timeInputs[i].id === 'long-break-input' && breakLongBreakLink.checked) null;
        else {
            timeInputs[i].disabled = false;
            timeInputs[i].classList.remove('line-through-long-break', 'opacity-long-break');
        }
        if (confirmTimeChanges[i].classList.contains('confirm-time-change-long-break') && breakLongBreakLink.checked) null;
        else {
            confirmTimeChanges[i].style.pointerEvents = 'auto';
            confirmTimeChanges[i].classList.remove('opacity-long-break', 'pointer-events-long-break');
        }
        if (timeInputLabels[i].getAttribute('for') === 'long-break-input' && breakLongBreakLink.checked) null;
        else timeInputLabels[i].classList.remove('line-through-long-break', 'opacity-long-break');
    }
}

/**
 * @param {HTMLElement} stop
 * @param {number} seconds
 * @return {void}
 */
function stopTimer(stop, seconds) {
    function runStopTimer() {
        if (breakSelected && pomodorosCount !== 4) seconds = parseInt(breakMinutes.textContent) * 60;
        else if (pomodorosCount === 4) seconds = longBreak * 60;
        else seconds = parseInt(sessionMinutes.textContent) * 60;
        if (!(pomodorosCount >= 1) || longBreakTimeSelected) timerStarted = false;
        stop.classList.add('shrink-animation');
        stop.disabled = true;
        setTimeout(() => {
            stop.classList.remove('shrink-animation');
            stop.disabled = false;
        }, 400);
        sessionSeconds = seconds;
        clearInterval(countdown);
        displayTimeLeft(seconds);
        isPaused = true;
        if (playPauseIcon.classList.contains('la-pause')) {
            togglePlayPause(playPauseIcon);
            if (zenModeToggle.checked) zenMode(true)();
        }
        autoStart.disabled = false;
        breakLongBreakLink.disabled = false;
        zenModeToggle.disabled = false;
        enableTimeInputs();
        document.title = 'Pomodoro';
        if (breakSelected) timerDisplay(seconds, false, true);
        else timerDisplay(seconds, true, true);
        checkTimerFont(sessionSeconds, timer);
    }
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 83) {
            if (e.repeat) return;
            runStopTimer();
        }
    });
    stop.addEventListener('click', runStopTimer);
}

/**
 * Stops timer and resets pomodoros.
 * 
 * @param {HTMLElement} stop
 * @param {*} seconds
 * @return {void}
 */
function stopTimerHard(seconds) {
    seconds = parseInt(sessionMinutes.textContent) * 60;
    timerStarted = false;
    seconds = parseInt(sessionMinutes.textContent) * 60;
    sessionSeconds = seconds;
    clearInterval(countdown);
    displayTimeLeft(seconds);
    breakSessionTitleReset();
    resetPomodoros(pomodoros);
    pomodorosCount = 0;
    breakSelected = false;
    sessionTimeSelected = true;
    breakTimeSelected = false;
    longBreakTimeSelected = false;
    isPaused = true;
    if (playPauseIcon.classList.contains('la-pause')) {
        togglePlayPause(playPauseIcon);
        if (zenModeToggle.checked) zenMode(true)();
    }
    autoStart.disabled = false;
    breakLongBreakLink.disabled = false;
    zenModeToggle.disabled = false;
    enableTimeInputs();
    document.title = 'Pomodoro';
    timerDisplay(seconds, true, true);
    checkTimerFont(sessionSeconds, timer);
}

/**
 * @param {HTMLElements} pomodoros
 * @return {void}
 */
function resetPomodoros(pomodoros) {
    pomodoros.forEach((pomodoro) => {
        if (!JSON.parse(localStorage.getItem('customThemeActive'))) {
            const pomodoroBorder = pomodoro.classList[1];
            pomodoro.classList = '';
            pomodoro.classList.add('pomodoro', pomodoroBorder);
        } else {
            pomodoro.classList = '';
            pomodoro.classList.add('pomodoro');
            pomodoro.style.backgroundColor = '';
        }
    });
}

// TODO: Add an option in settings to reset to default values.
/**
 * @param {HTMLElement} reset
 * @return {void}
 */
function resetTimer(reset) {
    function runResetTimer() {
        reset.setAttribute('style', 'transition: transform 0.4s ease-in-out; transform: rotate(-360deg)');
        reset.disabled = true;
        setTimeout(() => {
            reset.setAttribute('style', '');
            reset.disabled = false;
        }, 400);
        timerStarted = false;
        clearInterval(countdown);
        breakSessionTitleReset();
        breakSelected = false;
        sessionTimeSelected = true;
        breakTimeSelected = false;
        longBreakTimeSelected = false;
        enableTimeInputs();
        resetPomodoros(pomodoros);
        pomodorosCount = 0;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        longBreak = 15;
        isPaused = true;
        if (playPauseIcon.classList.contains('la-pause')) {
            togglePlayPause(playPauseIcon);
            if (zenModeToggle.checked) zenMode(true)();
        }
        autoStart.disabled = false;
        breakLongBreakLink.disabled = false;
        zenModeToggle.disabled = false;
        document.title = 'Pomodoro';
        displayTimeLeft(parseInt(sessionMinutes.textContent * 60, 10), false);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    }
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 82) {
            if (e.repeat) return;
            runResetTimer();
        }
    });
    reset.addEventListener('click', runResetTimer);
}

/**
 * @param {HTMLElement} notifications
 * @return {void}
 */
function toggleNotifications(notifications) {
    notifications.addEventListener('change', e => {
        if (e.target.checked) Notification.requestPermission().then();
    });
}

/**
 * Change the time of a time option through input.
 * 
 * @param {HTMLElement} confirmTimeChangeSession
 * @param {HTMLElement} sessionInput
 * @param {HTMLElement} confirmTimeChangeBreak
 * @param {HTMLElement} breakInput
 * @param {HTMLElement} confirmTimeChangeLongBreak
 * @param {HTMLElement} longBreakInput
 * @return {void}
 */
function changeTimeInput(confirmTimeChangeSession, sessionInput, confirmTimeChangeBreak, breakInput, confirmTimeChangeLongBreak, longBreakInput) {
    function checkIsDigit(e) {
        if (e.keyCode === 189 ||
            e.keyCode === 187 ||
            e.keyCode === 69 ||
            e.keyCode === 190) e.preventDefault();
    }

    /**
     * Check which time option is currently selected.
     * Update time option text value, timer display, and session seconds accordingly.
     * 
     * @param {HTMLElement} input
     * @param {HTMLElement} minutes
     * @param {boolean} isSession
     * @param {boolean} isLongBreak
     * @return {void}
     */
    function runConfirmTimeChange(input, minutes, isSession, isLongBreak) {
        let inputValue = input.value;
        if (inputValue > 6000) {
            inputValue = 6000;
            input.value = 6000;
        } else if (inputValue < 1 || input.length === 0) {
            inputValue = 1;
            input.value = 1;
        }
        if (isSession) {
            if (!breakSelected && !longBreakTimeSelected) {
                sessionSeconds = inputValue * 60;
                displayTimeLeft(sessionSeconds, false);
            }
        } else if (!isSession) {
            if (longBreakTimeSelected && breakLongBreakLink.checked) {
                longBreak = Math.min(inputValue * 3, 6000);
                sessionSeconds = longBreak * 60;
                longBreakMinutes.textContent = longBreak;
                displayTimeLeft(sessionSeconds, false);
            } else if (longBreakTimeSelected && !breakLongBreakLink.checked) {
                if (isLongBreak) {
                    sessionSeconds = inputValue * 60;
                    displayTimeLeft(sessionSeconds, false);
                }
            } else if (breakSelected && !isLongBreak) {
                sessionSeconds = inputValue * 60;
                displayTimeLeft(sessionSeconds, false);
            } else if (isLongBreak && longBreakTimeSelected) {
                sessionSeconds = inputValue * 60;
                displayTimeLeft(sessionSeconds, false);
            }
        }
        if (isLongBreak) longBreak = +inputValue;
        if (breakLongBreakLink.checked && !isSession) {
            longBreak = Math.min(inputValue * 3, 6000);
            longBreakMinutes.textContent = longBreak;
            longBreakInput.setAttribute('value', longBreak);
        }
        minutes.textContent = parseInt(inputValue, 10);
    }

    confirmTimeChangeSession.addEventListener('click', () => {
        runConfirmTimeChange(sessionInput, sessionMinutes, true, false);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    sessionInput.addEventListener('keydown', e => {
        checkIsDigit(e);
        if (e.keyCode === 13) {
            if (e.repeat) return;
            sessionInput.classList.add('shrink-animation-sm');
            sessionInput.disabled = true;
            setTimeout(() => {
                sessionInput.classList.remove('shrink-animation-sm');
                sessionInput.disabled = false;
            }, 400);
            runConfirmTimeChange(sessionInput, sessionMinutes, true, false);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });

    confirmTimeChangeBreak.addEventListener('click', () => {
        runConfirmTimeChange(breakInput, breakMinutes, false, false);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    breakInput.addEventListener('keydown', e => {
        checkIsDigit(e);
        if (e.keyCode === 13) {
            if (e.repeat) return;
            breakInput.classList.add('shrink-animation-sm');
            breakInput.disabled = true;
            setTimeout(() => {
                breakInput.classList.remove('shrink-animation-sm');
                breakInput.disabled = false;
            }, 400);
            runConfirmTimeChange(breakInput, breakMinutes, false, false);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });
    confirmTimeChangeLongBreak.addEventListener('click', () => {
        runConfirmTimeChange(longBreakInput, longBreakMinutes, false, true);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    longBreakInput.addEventListener('keydown', e => {
        if (e.keyCode === 13) {
            if (e.repeat) return;
            longBreakInput.classList.add('shrink-animation-sm');
            longBreakInput.disabled = true;
            setTimeout(() => {
                longBreakInput.classList.remove('shrink-animation-sm');
                longBreakInput.disabled = false;
            }, 400);
            runConfirmTimeChange(longBreakInput, longBreakMinutes, false, true);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });
}

/**
 * Adjust long break time in conjunction with break if link active.
 * 
 * @param {HTMLElement} breakLongBreakLink
 * @param {HTMLElement} longBreakInput
 * @param {HTMLElement} confirmTimeChangeLongBreak
 * @param {HTMLElement} timeInputLabelLongBreak
 * @param {HTMLElement} breakMinutes
 * @return {void}
 */
function breakLongBreakLinkCheck(breakLongBreakLink, longBreakInput, confirmTimeChangeLongBreak, timeInputLabelLongBreak, breakMinutes, returnRunBreakLongBreakLinkCheck) {
    function runBreakLongBreakLinkCheck(link) {
        if (link.checked) {
            longBreakInput.classList.add('line-through-long-break', 'opacity-long-break');
            timeInputLabelLongBreak.classList.add('line-through-long-break', 'opacity-long-break');
            confirmTimeChangeLongBreak.classList.add('opacity-long-break', 'pointer-events-long-break');
            confirmTimeChangeLongBreak.style.pointerEvents = 'none';
            longBreakInput.disabled = true;
            longBreak = Math.min(+breakMinutes.textContent * 3, 6000);
            longBreakMinutes.textContent = longBreak;
            longBreakInput.setAttribute('value', longBreak);
            if (longBreakTimeSelected) {
                displayTimeLeft(longBreak * 60, false);
                sessionSeconds = longBreak * 60;
            }
        } else if (!link.checked) {
            longBreakInput.classList.remove('line-through-long-break', 'opacity-long-break');
            timeInputLabelLongBreak.classList.remove('line-through-long-break', 'opacity-long-break');
            confirmTimeChangeLongBreak.classList.remove('opacity-long-break', 'pointer-events-long-break');
            confirmTimeChangeLongBreak.style.pointerEvents = 'auto';
            longBreakInput.disabled = false;
        }
    }
    breakLongBreakLink.addEventListener('change', () => {
        runBreakLongBreakLinkCheck(breakLongBreakLink);
        setStorageTime();
    });
    if (returnRunBreakLongBreakLinkCheck) return runBreakLongBreakLinkCheck;
}

/**
 * @param {HTMLElement} fullscreen
 * @return {void}
 */
function toggleFullScreen(fullscreen) {
    fullscreen.addEventListener('change', e => {
        if (e.target.checked && screenfull.enabled) screenfull.request();
        else screenfull.exit();
    });
}

function selectNotificationSound(options, play) {
    options.addEventListener('change', e => {
        if (e.target.value === 'none') {
            notificationSound = new Audio();
        } else {
            notificationSound = new Audio(`assets/sound/${e.target.value}.mp3`);
        }
        localStorage.setItem('notificationSound', JSON.stringify(optionsNotificationSound.value));
    });

    play.addEventListener('click', () => {
        notificationSound.play();
    });
}

function mainTimer() {
    // Storage
    setStorage();
    setStoragePreferences();
    loadStorage();
    clearStorage();
    logStorage();
    // Timer
    timerDisplay(sessionSeconds, true, false);
    // Time option select
    sessionBreakSelect(sessionTitle, breakTitle, longBreakTitle);
    // Controls
    pauseTimer(true);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
    // Preferences
    toggleNotifications(notifications);
    changeTimeInput(confirmTimeChangeSession, sessionInput, confirmTimeChangeBreak, breakInput, confirmTimeChangeLongBreak, longBreakInput);
    breakLongBreakLinkCheck(breakLongBreakLink, longBreakInput, confirmTimeChangeLongBreak, timeInputLabelLongBreak, breakMinutes, false);
    toggleFullScreen(fullscreen);
    // Sound
    selectNotificationSound(optionsNotificationSound, playNotificationSound);
}

window.onload = mainTimer();