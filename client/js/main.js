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
let autoStart = document.querySelector('#auto-start');
let notifications = document.querySelector('#notifications');
let breakSelected = false;
let sessionTimeSelected = true;
let breakTimeSelected = false;
let longBreak = 15;
const notificationIcon = 'favicon/android-chrome-192x192.png';

// TODO: Add documentation on GitHub
// TODO: Add modifiable session/break times through text input when selecting number
// TODO: Add notifications when a session/break finishes
// TODO: Add a to-do list under the timer. It should feature the ability to add, delete, tag, and be expandable with more info (a description).
// TODO: Add option to toggle on/off the tab title time display
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
                    currentActive = titleBorderChange();
                    if (pomodorosCount === 4) {
                        Push.create('Long break over!', {
                            body: 'Session started.',
                            icon: notificationIcon
                        });
                        breakSelected = false;
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
                        pomodorosCount++;
                        if (!customThemeActive) pomodoros[pomodorosCount - 1].classList.add(`${currentActive.split('-')[0]}-background`);
                        else pomodoros[pomodorosCount - 1].setAttribute('style', `background-color: ${customValueContent}; border-color: ${customValueContent};`);
                        if (pomodorosCount === 4) {
                            sessionSeconds = Math.min(longBreak * 60, 6000);
                            Push.create('Session over!', {
                                body: 'Long break started.',
                                icon: notificationIcon
                            });
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

function sessionBreakSelect(sessionTime, breakTime) {
    // TODO: pop up warning if timer has started
    function runSessionSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        breakSelected = false;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, true, true);
        if (sessionTimeSelected) null;
        else if (breakTimeSelected) {
            breakTimeSelected = false;
            sessionTimeSelected = true;
            titleBorderChange();
        }
    }

    function runBreakSelect() {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        breakSelected = true;
        sessionSeconds = parseInt(breakMinutes.textContent) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false, true);
        if (breakTimeSelected) null;
        else if (sessionTimeSelected) {
            breakTimeSelected = true;
            sessionTimeSelected = false;
            titleBorderChange();
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
}

function titleBorderChange() {
    let currentActive;
    if (!customThemeActive) {
        sessionTitle.classList.length >= 1 ?
            currentActive = sessionTitle.classList[sessionTitle.classList.length - 1] :
            currentActive = breakTitle.classList[breakTitle.classList.length - 1];
        breakTitle.classList.toggle(currentActive);
        sessionTitle.classList.toggle(currentActive);
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
                displayTimeLeft(parseInt(minutes.textContent) * 60, false);
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
                displayTimeLeft(parseInt(minutes.textContent) * 60, false);
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
    if (!title) return;
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

function mainTimer() {
    timerDisplay(sessionSeconds, true, false);
    timerSession(increaseSession, sessionMinutes, decreaseSession, true);
    timerSession(increaseBreak, breakMinutes, decreaseBreak, false);
    sessionBreakSelect(sessionTitle, breakTitle);
    pauseTimer(pause, true);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
    toggleNotifications(notifications);
}

window.onload = mainTimer();