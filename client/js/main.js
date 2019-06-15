let countdown;
const timer = document.querySelector('#timer');
let timerStarted = false;
const play = document.querySelector('#play');
const pause = document.querySelector('#pause');
const stop = document.querySelector('#stop');
const reset = document.querySelector('#reset');
const arrow = document.querySelectorAll('.arrow');
const pomodoros = document.querySelectorAll('.pomodoro');
let pomodorosCount = 0;
const sessionTitle = document.querySelector('.session-title h3');
const increaseSession = document.querySelector('#increase-session');
const sessionMinutes = document.querySelector('#session-minutes');
let sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
const breakTitle = document.querySelector('.break-title h3');
const decreaseSession = document.querySelector('#decrease-session');
const increaseBreak = document.querySelector('#increase-break');
const breakMinutes = document.querySelector('#break-minutes');
const decreaseBreak = document.querySelector('#decrease-break');
let customThemeSwitch = true;
const autoStart = document.querySelector('#auto-start');
const notifications = document.querySelector('#notifications');
const tabTitleTime = document.querySelector('#tab-title-time');
let breakSelected = false;
let sessionTimeSelected = true;
let breakTimeSelected = false;
let longBreakTimeSelected = false;
let longBreak = 15;
const notificationIcon = 'favicon/android-chrome-192x192.png';
const confirmTimeChangeSession = document.querySelector('.confirm-time-change-session');
const sessionInput = document.querySelector('#session-input');
const confirmTimeChangeBreak = document.querySelector('.confirm-time-change-break');
const breakInput = document.querySelector('#break-input');
const confirmTimeChangeLongBreak = document.querySelector('.confirm-time-change-long-break');
const longBreakInput = document.querySelector('#long-break-input');
const longBreakPomodoro = document.querySelector('.pomodoro:last-of-type');


// TODO: Add documentation on GitHub
// TODO: Add preference to NOT have break and long break linked together
// TODO: Add a to-do list under the timer. It should feature the ability to add, delete, tag, and be expandable with more info (a description)
function timerDisplay(seconds, breakTime = true, returnRunTimerDisplay) {
    function runTimerDisplay() {
        if (!timerStarted) timerStarted = true;
        if (breakSelected && pomodorosCount !== 4 && !timerStarted) sessionSeconds = breakMinutes.textContent * 60;
        seconds = sessionSeconds;
        clearInterval(countdown);
        autoStart.disabled = true;
        play.disabled = true;
        pause.disabled = false;
        stop.disabled = false;
        sessionInput.disabled = true;
        breakInput.disabled = true;
        confirmTimeChangeSession.style.pointerEvents = 'none';
        confirmTimeChangeBreak.style.pointerEvents = 'none';
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
                        pomodoros.forEach((pomodoro) => {
                            if (!customThemeActive) pomodoro.classList.remove(`${currentActive.split('-')[0]}-background`);
                            else pomodoro.setAttribute('style', `background-color: ${customValueBody}; border-color: ${customValueContent};`);
                        });
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, true, true)();
                        play.disabled = false;
                    } else if (breakTime && !breakSelected) {
                        breakSelected = true;
                        breakTimeSelected = true;
                        sessionTimeSelected = false;
                        pomodorosCount++;
                        if (!customThemeActive) pomodoros[pomodorosCount - 1].classList.add(`${currentActive.split('-')[0]}-background`);
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

function sessionBreakSelect(sessionTime, breakTime, longBreakPomodoro) {
    // TODO: pop up warning if timer has started
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
        pomodoros.forEach(pomodoro => {
            if (!customThemeActive) pomodoro.classList.add(`${currentActive.split('-')[0]}-background`);
            else pomodoro.setAttribute('style', `background-color: ${customValueContent}; border-color: ${customValueContent};`);
        });
        if (breakTimeSelected) null;
        else if (sessionTimeSelected) {
            breakTimeSelected = true;
            sessionTimeSelected = false;
            titleBorderChange(false);
        }
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

function titleBorderChange(noTitleToggle) {
    let currentActive;
    if (!customThemeActive) {
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

function timerSession(increase, minutes, decrease, session = true) {
    function runIncrease(isThroughKey = false) {
        if ((parseInt(minutes.textContent) >= 6000) ||
            (!session && !breakSelected && isThroughKey) ||
            (session && breakSelected && isThroughKey)) {
            return;
        } else {
            minutes.textContent = parseInt(minutes.textContent) + 1;
            if (session) {
                if (!breakSelected) displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds += 60;
            } else if (breakSelected) {
                if (breakTimeSelected && longBreakTimeSelected) displayTimeLeft((parseInt(minutes.textContent) * 3) * 60, false);
                else displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds += 60;
            }
        }
        longBreak = parseInt(breakMinutes.textContent) * 3;
    }
    increase.addEventListener('click', () => {
        runIncrease(false);
    });
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 38 && !timerStarted) {
            runIncrease(true);
        }
    });

    function runDecrease(isThroughKey = false) {
        if ((parseInt(minutes.textContent) <= 1) ||
            (!session && !breakSelected && isThroughKey) ||
            (session && breakSelected && isThroughKey)) {
            return;
        } else {
            minutes.textContent = parseInt(minutes.textContent) - 1;
            if (session) {
                if (!breakSelected) displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds -= 60;
            } else if (breakSelected) {
                if (breakTimeSelected && longBreakTimeSelected) displayTimeLeft((parseInt(minutes.textContent) * 3) * 60, false);
                else displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds -= 60;
            }
        }
        longBreak = parseInt(breakMinutes.textContent) * 3;
    }
    decrease.addEventListener('click', () => {
        runDecrease(false);
    });
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 40 && !timerStarted) {
            runDecrease(true);
        }
    });
}

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

function pauseTimer(pause, clickRun) {
    function runPauseTimer() {
        clearInterval(countdown);
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

function breakSessionTitleReset() {
    if (breakTitle.classList.length >= 1) {
        sessionTitle.classList.add(breakTitle.classList[breakTitle.classList.length - 1]);
        breakTitle.classList = '';
    } else if (customThemeActive) {
        sessionTitle.style.background = `linear-gradient(to right, ${customValueContent}, ${customValueContent}) no-repeat`;
        sessionTitle.style.backgroundSize = 'var(--pomodoro-size)';
        sessionTitle.style.backgroundPosition = 'var(--pomodoro-position)';
        breakTitle.style.background = '';
        customThemeSwitch = true;
    }
}

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
        sessionInput.disabled = false;
        breakInput.disabled = false;
        confirmTimeChangeSession.style.pointerEvents = 'auto';
        confirmTimeChangeBreak.style.pointerEvents = 'auto';
        arrow.forEach(arrow => {
            arrow.disabled = false;
        });
        document.title = 'Pomodoro';
        if (breakSelected) timerDisplay(seconds, false, true);
        else timerDisplay(seconds, true, true);
    }
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 83) {
            if (e.repeat) return
            runStopTimer();
        }
    });
    stop.addEventListener('click', runStopTimer);
}

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
    stop.disabled = true;
    pause.disabled = true;
    play.disabled = false;
    autoStart.disabled = false;
    sessionInput.disabled = false;
    breakInput.disabled = false;
    confirmTimeChangeSession.style.pointerEvents = 'auto';
    confirmTimeChangeBreak.style.pointerEvents = 'auto';
    arrow.forEach(arrow => {
        arrow.disabled = false;
    });
    document.title = 'Pomodoro';
    timerDisplay(seconds, true, true);
}

function resetPomodoros(pomodoros) {
    pomodoros.forEach((pomodoro) => {
        if (!customThemeActive) {
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
        sessionInput.disabled = false;
        breakInput.disabled = false;
        confirmTimeChangeSession.style.pointerEvents = 'auto';
        confirmTimeChangeBreak.style.pointerEvents = 'auto';
        resetPomodoros(pomodoros);
        pomodorosCount = 0;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        breakMinutes.textContent = '5';
        longBreak = 15;
        arrow.forEach(arrow => {
            arrow.disabled = false;
        });
        play.disabled = false;
        autoStart.disabled = false;
        document.title = 'Pomodoro';
        timerDisplay(parseInt(timer.textContent.split(':')[0]) * 60, true, true);
    }
    document.addEventListener('keydown', e => {
        if (e.altKey && e.keyCode === 82) {
            if (e.repeat) return;
            runResetTimer();
        }
    });
    reset.addEventListener('click', runResetTimer);
}

function toggleNotifications(notifications) {
    notifications.addEventListener('change', e => {
        if (e.target.checked) Push.Permission.request();
    });
}

// TODO: Input for long break
function changeTimeInput(confirmTimeChangeSession, sessionInput, confirmTimeChangeBreak, breakInput) {
    function checkIsDigit(e) {
        if (e.keyCode === 189 ||
            e.keyCode === 187 ||
            e.keyCode === 69 ||
            e.keyCode === 190) e.preventDefault();
    }

    function runConfirmTimeChange(input, minutes, isSession) {
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
                displayTimeLeft(inputValue * 60, false);
                sessionSeconds = inputValue * 60;
            }
        } else if (!isSession) {
            if (breakSelected) {
                displayTimeLeft(inputValue * 60, false);
                sessionSeconds = inputValue * 60;
            }
        }
        minutes.textContent = parseInt(inputValue, 10);
    }

    confirmTimeChangeSession.addEventListener('click', () => {
        runConfirmTimeChange(sessionInput, sessionMinutes, true);
    });
    sessionInput.addEventListener('keydown', e => {
        checkIsDigit(e);
        if (e.keyCode === 13) {
            if (e.repeat) return;
            runConfirmTimeChange(sessionInput, sessionMinutes, true);
        }
    });

    confirmTimeChangeBreak.addEventListener('click', () => {
        runConfirmTimeChange(breakInput, breakMinutes, false);
    });
    breakInput.addEventListener('keydown', e => {
        checkIsDigit(e);
        if (e.keyCode === 13) {
            if (e.repeat) return;
            runConfirmTimeChange(breakInput, breakMinutes, false);
        }
    });
    // TEMP: Disabled because no functionality
    longBreakInput.disabled = true;
    confirmTimeChangeLongBreak.style.pointerEvents = 'none';
}

function mainTimer() {
    timerDisplay(sessionSeconds, true, false);
    timerSession(increaseSession, sessionMinutes, decreaseSession, true);
    timerSession(increaseBreak, breakMinutes, decreaseBreak, false);
    sessionBreakSelect(sessionTitle, breakTitle, longBreakPomodoro);
    pauseTimer(pause, true);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
    toggleNotifications(notifications);
    changeTimeInput(confirmTimeChangeSession, sessionInput, confirmTimeChangeBreak, breakInput);
}

window.onload = mainTimer();