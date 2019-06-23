// Timer
let countdown;
const timer = document.querySelector('#timer');
let timerStarted = false;
// Timer controls
const play = document.querySelector('#play');
const pause = document.querySelector('#pause');
const stop = document.querySelector('#stop');
const reset = document.querySelector('#reset');
const arrow = document.querySelectorAll('.arrow');
// Pomodoros
const pomodoros = document.querySelectorAll('.pomodoro');
let pomodorosCount = 0;
// Session
const sessionTitle = document.querySelector('.session-title h3');
const increaseSession = document.querySelector('#increase-session');
const sessionMinutes = document.querySelector('#session-minutes');
const decreaseSession = document.querySelector('#decrease-session');
// Break
const breakTitle = document.querySelector('.break-title h3');
const increaseBreak = document.querySelector('#increase-break');
const breakMinutes = document.querySelector('#break-minutes');
const decreaseBreak = document.querySelector('#decrease-break');
// Long break
let longBreak = 15;
const longBreakPomodoro = document.querySelector('.pomodoro:last-of-type');
const longBreakInput = document.querySelector('#long-break-input');
const confirmTimeChangeLongBreak = document.querySelector('.confirm-time-change-long-break');
const timeInputLabelLongBreak = document.querySelector('.time-input-wrapper:last-child>label');
// Current seconds
let sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
// Preferences
const autoStart = document.querySelector('#auto-start');
const notifications = document.querySelector('#notifications');
const tabTitleTime = document.querySelector('#tab-title-time');
const breakLongBreakLink = document.querySelector('#break-long-break-link');
const preferences = document.querySelectorAll('.preference');
// Selections
let breakSelected = false;
let sessionTimeSelected = true;
let breakTimeSelected = false;
let longBreakTimeSelected = false;
let customThemeSwitch = true;
// Time inputs
const confirmTimeChanges = document.querySelectorAll('.confirm-time-change');
const sessionInput = document.querySelector('#session-input');
const confirmTimeChangeSession = document.querySelector('.confirm-time-change-session');
const breakInput = document.querySelector('#break-input');
const confirmTimeChangeBreak = document.querySelector('.confirm-time-change-break');
const timeInputs = document.querySelectorAll('.time-input');
const timeInputLabels = document.querySelectorAll('.time-input-wrapper>label');
// Icon
const notificationIcon = 'favicon/android-chrome-192x192.png';

// TODO: Add guide on info modal
// TODO: Switch push.js notifications to use vanilla notifications API (maybe, have to do more research)
// TODO: Add a to-do list under the timer. It should feature the ability to add, delete, tag, and be expandable with more info (a description)
// TODO: Add option to clear all local storage
// FIXME: Delay in time for tab title. Use web workers to solve this
// FIXME: Slight nudge to timer when on mobile times of >=60 minutes are selected

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
 * @param {DOM element} timer
 * @return {void}
 */
function checkTimerFont(seconds, timer) {
    if (seconds === 360000 && window.matchMedia('(max-width: 420px)').matches) {
        timer.style.fontSize = '4.688rem';
    } else if (seconds >= 3600 && window.matchMedia('(max-width: 420px)').matches) {
        timer.style.fontSize = '5rem';
    } else {
        timer.style.fontSize = '5.625rem';
    }
}

function loadStorage() {
    // Time
    sessionMinutes.textContent = JSON.parse(localStorage.getItem('session'));
    sessionSeconds = +sessionMinutes.textContent * 60;
    displayTimeLeft(sessionSeconds, false);
    breakMinutes.textContent = JSON.parse(localStorage.getItem('break'));
    longBreak = JSON.parse(localStorage.getItem('longBreak'));
    // Preferences
    autoStart.checked = JSON.parse(localStorage.getItem('autoStart'));
    notifications.checked = JSON.parse(localStorage.getItem('notifications'));
    tabTitleTime.checked = JSON.parse(localStorage.getItem('tabTitleTime'));
    breakLongBreakLink.checked = JSON.parse(localStorage.getItem('breakLongBreakLink'));
    breakLongBreakLinkCheck(breakLongBreakLink, longBreakInput, confirmTimeChangeLongBreak, timeInputLabelLongBreak, breakMinutes, true)(breakLongBreakLink);
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
        });
        declineClear.addEventListener('click', () => {
            storageWarningBackground.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === storageWarningBackground) storageWarningBackground.style.display = 'none';
        });
    });
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
        pause.disabled = false;
        stop.disabled = false;
        // Disable time inputs and buttons while timer is running
        autoStart.disabled = true;
        breakLongBreakLink.disabled = true;
        play.disabled = true;
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
        arrow.forEach(arrow => {
            arrow.disabled = true;
        });
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
                    currentActive = titleBorderChange(false);
                    if (pomodorosCount === 4) {
                        Push.create('Long break over!', {
                            body: 'Session started.',
                            icon: notificationIcon
                        });
                        breakSelected = false;
                        breakTimeSelected = true;
                        sessionTimeSelected = false;
                        longBreakTimeSelected = false;
                        pomodorosCount = 0;
                        // Reset pomodoros to correct colors
                        pomodoros.forEach((pomodoro) => {
                            if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoro.classList.remove(`${currentActive.split('-')[0]}-background`);
                            else pomodoro.setAttribute('style', `background-color: ${customValueBody}; border-color: ${customValueContent};`);
                        });
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, true, true)();
                        play.disabled = false;
                    } else if (breakTime && !breakSelected) {
                        // Session finishes, start break or long break
                        breakSelected = true;
                        breakTimeSelected = true;
                        sessionTimeSelected = false;
                        pomodorosCount++;
                        // Fill in next pomodoro
                        if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoros[pomodorosCount - 1].classList.add(`${currentActive.split('-')[0]}-background`);
                        else pomodoros[pomodorosCount - 1].setAttribute('style', `background-color: ${customValueContent}; border-color: ${customValueContent};`);
                        if (pomodorosCount === 4) {
                            sessionSeconds = Math.min(longBreak * 60, 6000);
                            Push.create('Session over!', {
                                body: 'Long break started.',
                                icon: notificationIcon
                            });
                            longBreakTimeSelected = true;
                        } else {
                            sessionSeconds = parseInt(breakMinutes.textContent) * 60;
                            Push.create('Session over!', {
                                body: 'Break started.',
                                icon: notificationIcon
                            });
                        }
                        timerDisplay(sessionSeconds, false, true)();
                        play.disabled = false;
                    } else {
                        Push.create('Break over!', {
                            body: 'Session started.',
                            icon: notificationIcon
                        });
                        breakSelected = false;
                        breakTimeSelected = false;
                        sessionTimeSelected = true;
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, true, true)();
                        play.disabled = false;
                    }
                }
            }
            displayTimeLeft(secondsLeft);
        }, 1000);
    }
    if (returnRunTimerDisplay) return runTimerDisplay;
    document.addEventListener('keydown', e => {
        if (e.keyCode === 32) {
            if (e.repeat) return;
            if (pause.disabled) runTimerDisplay();
            else pauseTimer(pause, false)();
        }
    });
    play.addEventListener('click', runTimerDisplay);
}

/**
 * Allows selection of a session, break, or long break.
 * Displays correct time and selection.
 * 
 * @param {DOM element} sessionTime
 * @param {DOM element} breakTime
 * @param {DOM element} longBreakPomodoro
 * @return {void}
 */
function sessionBreakSelect(sessionTime, breakTime, longBreakPomodoro) {
    function runSessionSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        if (sessionSeconds === longBreak * 60) resetPomodoros(pomodoros);
        breakSelected = false;
        longBreakTimeSelected = false;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        pomodorosCount = 0;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, true, true);
        if (sessionTimeSelected) null;
        else if (breakTimeSelected) {
            breakTimeSelected = false;
            sessionTimeSelected = true;
            titleBorderChange(false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    function runBreakSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        if (sessionSeconds === longBreak * 60) resetPomodoros(pomodoros);
        breakSelected = true;
        longBreakTimeSelected = false;
        sessionSeconds = parseInt(breakMinutes.textContent) * 60;
        pomodorosCount = 0;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false, true);
        if (breakTimeSelected) null;
        else if (sessionTimeSelected) {
            breakTimeSelected = true;
            sessionTimeSelected = false;
            titleBorderChange(false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    function runLongBreakSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        breakSelected = true;
        longBreakTimeSelected = true;
        sessionSeconds = parseInt(longBreak) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false, true);
        currentActive = titleBorderChange(true);
        pomodorosCount = 4;
        // Fill in all four pomodoros
        pomodoros.forEach(pomodoro => {
            if (!JSON.parse(localStorage.getItem('customThemeActive'))) pomodoro.classList.add(`${currentActive.split('-')[0]}-background`);
            else pomodoro.setAttribute('style', `background-color: ${customValueContent}; border-color: ${customValueContent};`);
        });
        if (breakTimeSelected) null;
        else if (sessionTimeSelected) {
            breakTimeSelected = true;
            sessionTimeSelected = false;
            titleBorderChange(false);
        }
        checkTimerFont(sessionSeconds, timer);
    }

    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 80) {
            if (e.repeat) return
            runSessionSelect();
        }
    });
    sessionTime.addEventListener('click', runSessionSelect);
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 66) {
            if (e.repeat) return
            runBreakSelect();
        }
    });
    breakTime.addEventListener('click', runBreakSelect);
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 76) {
            if (e.repeat) return;
            runLongBreakSelect();
        }
    });
    longBreakPomodoro.addEventListener('click', runLongBreakSelect);
}

/**
 * Changes border under session or select.
 * Adjusts colors and classes as needed.
 * 
 * @param {boolean} noTitleToggle
 * @return {DOM class || void}
 */
function titleBorderChange(noTitleToggle) {
    let currentActive;
    if (!JSON.parse(localStorage.getItem('customThemeActive'))) {
        sessionTitle.classList.length >= 1 ?
            currentActive = sessionTitle.classList[sessionTitle.classList.length - 1] :
            currentActive = breakTitle.classList[breakTitle.classList.length - 1];
        if (noTitleToggle) return currentActive;
        breakTitle.classList.toggle(currentActive);
        sessionTitle.classList.toggle(currentActive);
    } else if (noTitleToggle) {
        return;
    } else {
        sessionTitle.classList = '';
        breakTitle.classList = '';
        if (customThemeSwitch) {
            customThemeSwitch = false;
            sessionTitle.style.background = '';
            sessionTitle.style.backgroundSize = '';
            sessionTitle.style.backgroundPosition = '';
            breakTitle.style.background = `linear-gradient(to right, ${customValueContent}, ${customValueContent}) no-repeat`;
            breakTitle.style.backgroundSize = 'var(--pomodoro-size)';
            breakTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        } else {
            customThemeSwitch = true;
            breakTitle.style.background = '';
            breakTitle.style.backgroundSize = '';
            breakTitle.style.backgroundPosition = '';
            sessionTitle.style.background = `linear-gradient(to right, ${customValueContent}, ${customValueContent}) no-repeat`;
            sessionTitle.style.backgroundSize = 'var(--pomodoro-size)';
            sessionTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        }
    }
    return currentActive;
}

/**
 * Increase or decrease time relative to the desired time option.
 * 
 * @param {DOM element} increase
 * @param {DOM element} minutes
 * @param {DOM element} decrease
 * @param {boolean} session
 * @return {void}
 */
function timerSession(increase, minutes, decrease, session = true) {
    function runIncrease(isThroughKey = false) {
        const minutesTextContent = parseInt(minutes.textContent);
        if ((parseInt(minutes.textContent) >= 6000 && !longBreakTimeSelected) ||
            (longBreak >= 6000 && longBreakTimeSelected && !session && minutesTextContent >= 6000) ||
            (!session && !breakSelected && isThroughKey) ||
            (session && breakSelected && isThroughKey) ||
            (breakLongBreakLink.checked && longBreak === 6000 && !session && minutesTextContent >= 6000)) {
            return;
        } else {
            if (longBreakTimeSelected && !breakLongBreakLink.checked && !session) {
                sessionSeconds += 60;
                longBreak += 1;
                displayTimeLeft(sessionSeconds, false);
            } else minutes.textContent = parseInt(minutes.textContent) + 1;
            if (session) {
                if (!breakSelected) displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                if (!breakSelected && !longBreakTimeSelected) sessionSeconds += 60;
            } else if (breakSelected) {
                if (breakTimeSelected && longBreakTimeSelected && breakLongBreakLink.checked && minutesTextContent < 2000) displayTimeLeft((parseInt(minutes.textContent) * 3) * 60, false);
                else if (longBreakTimeSelected) null;
                else displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                if (!longBreakTimeSelected) sessionSeconds += 60;
                else if (breakLongBreakLink.checked) null;
                else if (breakLongBreakLink.checked) sessionSeconds += 60 * 3;
            }
        }
        if (breakLongBreakLink.checked && longBreak !== 6000) longBreak = parseInt(breakMinutes.textContent) * 3;
    }
    increase.addEventListener('click', () => {
        runIncrease(false);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 38 && !timerStarted) {
            runIncrease(true);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });

    function runDecrease(isThroughKey = false) {
        if ((parseInt(minutes.textContent) <= 1 && !longBreakTimeSelected) ||
            (longBreak <= 1 && longBreakTimeSelected && !session) ||
            (!session && !breakSelected && isThroughKey) ||
            (session && breakSelected && isThroughKey) ||
            (breakLongBreakLink.checked && longBreak === 3 && !session)) {
            return;
        }

        const breakMinutesContent = parseInt(breakMinutes.textContent) * 3;

        if (longBreakTimeSelected && !breakLongBreakLink.checked && !session) {
            sessionSeconds -= 60;
            longBreak -= 1;
            displayTimeLeft(sessionSeconds, false);
        } else minutes.textContent = parseInt(minutes.textContent) - 1;
        if (session) {
            if (!breakSelected) displayTimeLeft(parseInt(minutes.textContent) * 60, false);
            if (!breakSelected && !longBreakTimeSelected) sessionSeconds -= 60;
        } else if (breakSelected) {
            if (breakTimeSelected && longBreakTimeSelected && breakLongBreakLink.checked && breakMinutesContent <= 6000) displayTimeLeft((parseInt(minutes.textContent) * 3) * 60, false);
            else if (longBreakTimeSelected) null;
            else displayTimeLeft(parseInt(minutes.textContent) * 60, false);
            if (!longBreakTimeSelected) sessionSeconds -= 60;
            else if (breakLongBreakLink.checked && breakMinutesContent >= 2000) null;
            else if (breakLongBreakLink.checked) sessionSeconds -= 60 * 3;
        }
        if (breakLongBreakLink.checked && breakMinutesContent <= 6000) longBreak = parseInt(breakMinutes.textContent) * 3;
    }
    decrease.addEventListener('click', () => {
        runDecrease(false);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 40 && !timerStarted) {
            runDecrease(true);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });
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
 * @param {DOM element} pause
 * @param {boolean} clickRun
 * @return {function || void}
 */
function pauseTimer(pause, clickRun) {
    function runPauseTimer() {
        clearInterval(countdown);
        // Resume timer for session or break
        sessionTitle.classList >= 1 ? timerDisplay(0, true, true) : timerDisplay(0, false, true);
        pause.disabled = true;
        play.disabled = false;
    }

    if (!clickRun) return runPauseTimer;
    else {
        pause.disabled = true;
        pause.addEventListener('click', runPauseTimer);
    }
}

/**
 * On timer reset, move bottom border indicator to session.
 * 
 * @return {void}
 */
function breakSessionTitleReset() {
    if (breakTitle.classList.length >= 1) {
        sessionTitle.classList.add(breakTitle.classList[breakTitle.classList.length - 1]);
        breakTitle.classList = '';
    } else if (JSON.parse(localStorage.getItem('customThemeActive'))) {
        sessionTitle.style.background = `linear-gradient(to right, ${customValueContent}, ${customValueContent}) no-repeat`;
        sessionTitle.style.backgroundSize = 'var(--pomodoro-size)';
        sessionTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        breakTitle.style.background = '';
        customThemeSwitch = true;
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
 * @param {DOM element} stop
 * @param {number} seconds
 * @return {void}
 */
function stopTimer(stop, seconds) {
    stop.disabled = true;

    function runStopTimer() {
        if (breakSelected && pomodorosCount !== 4) seconds = parseInt(breakMinutes.textContent) * 60;
        else if (pomodorosCount === 4) seconds = longBreak * 60;
        else seconds = parseInt(sessionMinutes.textContent) * 60;
        timerStarted = false;
        sessionSeconds = seconds;
        clearInterval(countdown);
        displayTimeLeft(seconds);
        stop.disabled = true;
        pause.disabled = true;
        play.disabled = false;
        autoStart.disabled = false;
        breakLongBreakLink.disabled = false;
        enableTimeInputs();
        arrow.forEach(arrow => {
            arrow.disabled = false;
        });
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
 * @param {DOM element} stop
 * @param {*} seconds
 * @return {void}
 */
function stopTimerHard(stop, seconds) {
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
    stop.disabled = true;
    pause.disabled = true;
    play.disabled = false;
    autoStart.disabled = false;
    breakLongBreakLink.disabled = false;
    enableTimeInputs();
    arrow.forEach(arrow => {
        arrow.disabled = false;
    });
    document.title = 'Pomodoro';
    timerDisplay(seconds, true, true);
    checkTimerFont(sessionSeconds, timer);
}

/**
 * @param {DOM elements} pomodoros
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

/**
 * @param {DOM element} reset
 * @return {void}
 */
function resetTimer(reset) {
    function runResetTimer() {
        timerStarted = false;
        clearInterval(countdown);
        timer.textContent = '25:00';
        sessionMinutes.textContent = '25';
        breakSessionTitleReset();
        breakSelected = false;
        sessionTimeSelected = true;
        breakTimeSelected = false;
        longBreakTimeSelected = false;
        enableTimeInputs();
        resetPomodoros(pomodoros);
        pomodorosCount = 0;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        breakMinutes.textContent = '5';
        longBreak = 15;
        arrow.forEach(arrow => {
            arrow.disabled = false;
        });
        play.disabled = false;
        pause.disabled = true;
        autoStart.disabled = false;
        breakLongBreakLink.disabled = false;
        document.title = 'Pomodoro';
        timerDisplay(parseInt(timer.textContent.split(':')[0]) * 60, true, true);
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
 * @param {DOM element} notifications
 * @return {void}
 */
function toggleNotifications(notifications) {
    notifications.addEventListener('change', e => {
        if (e.target.checked) Push.Permission.request();
    });
}

/**
 * Change the time of a time option through input.
 * 
 * @param {DOM element} confirmTimeChangeSession
 * @param {DOM element} sessionInput
 * @param {DOM element} confirmTimeChangeBreak
 * @param {DOM element} breakInput
 * @param {DOM element} confirmTimeChangeLongBreak
 * @param {DOM element} longBreakInput
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
     * @param {DOM element} input
     * @param {DOM element} minutes
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
            if (!breakSelected) {
                sessionSeconds = inputValue * 60;
                displayTimeLeft(sessionSeconds, false);
            }
        } else if (!isSession) {
            if (longBreakTimeSelected && breakLongBreakLink.checked) {
                longBreak = Math.min(inputValue * 3, 6000);
                sessionSeconds = longBreak * 60;
                displayTimeLeft(sessionSeconds, false)
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
        if (breakLongBreakLink.checked && !isSession) longBreak = Math.min(inputValue * 3, 6000);
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
            runConfirmTimeChange(breakInput, breakMinutes, false, false);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });
    confirmTimeChangeLongBreak.addEventListener('click', () => {
        runConfirmTimeChange(longBreakInput, longBreak, false, true);
        checkTimerFont(sessionSeconds, timer);
        setStorageTime();
    });
    longBreakInput.addEventListener('keydown', e => {
        if (e.keyCode === 13) {
            if (e.repeat) return;
            runConfirmTimeChange(longBreakInput, longBreak, false, true);
            checkTimerFont(sessionSeconds, timer);
            setStorageTime();
        }
    });
}

/**
 * Adjust long break time in conjunction with break if link active.
 * 
 * @param {DOM element} breakLongBreakLink
 * @param {DOM element} longBreakInput
 * @param {DOM element} confirmTimeChangeLongBreak
 * @param {DOM element} timeInputLabelLongBreak
 * @param {DOM element} breakMinutes
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
    });
    if (returnRunBreakLongBreakLinkCheck) return runBreakLongBreakLinkCheck;
}

function mainTimer() {
    // Storage
    setStorage();
    setStoragePreferences();
    loadStorage();
    clearStorage();
    // Timer
    timerDisplay(sessionSeconds, true, false);
    timerSession(increaseSession, sessionMinutes, decreaseSession, true);
    timerSession(increaseBreak, breakMinutes, decreaseBreak, false);
    // Time option select
    sessionBreakSelect(sessionTitle, breakTitle, longBreakPomodoro);
    // Controls
    pauseTimer(pause, true);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
    // Preferences
    toggleNotifications(notifications);
    changeTimeInput(confirmTimeChangeSession, sessionInput, confirmTimeChangeBreak, breakInput, confirmTimeChangeLongBreak, longBreakInput);
    breakLongBreakLinkCheck(breakLongBreakLink, longBreakInput, confirmTimeChangeLongBreak, timeInputLabelLongBreak, breakMinutes, false);
}

window.onload = mainTimer();