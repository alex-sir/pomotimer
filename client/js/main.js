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
let breakSelected = false;
let sessionTimeSelected = true;
let breakTimeSelected = false;
let longBreak = 15;

function timerDisplay(seconds, breakTime = true) {
    play.addEventListener('click', () => {
        timerStarted = true;
        if (breakSelected && pomodorosCount !== 4) sessionSeconds = breakMinutes.textContent * 60;
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
                        breakSelected = false;
                        pomodorosCount = 0;
                        pomodoros.forEach((pomodoro) => {
                            if (!customThemeActive) pomodoro.classList.remove(`${currentActive.split('-')[0]}-background`);
                            else pomodoro.setAttribute('style', `background-color: ${customValueBody}; border-color: ${customValueContent};`);
                        });
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds);
                        play.disabled = false;
                        play.click();
                    } else if (breakTime) {
                        breakSelected = true;
                        pomodorosCount++;
                        if (!customThemeActive) pomodoros[pomodorosCount - 1].classList.add(`${currentActive.split('-')[0]}-background`);
                        else {
                            pomodoros[pomodorosCount - 1].setAttribute('style', `background-color: ${customValueContent}; border-color: ${customValueContent};`);
                        }
                        pomodorosCount === 4 ?
                            sessionSeconds = Math.min(longBreak * 60, 6000) :
                            sessionSeconds = parseInt(breakMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds, false);
                        play.disabled = false;
                        play.click();
                    } else {
                        breakSelected = false;
                        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                        timerDisplay(sessionSeconds);
                        play.disabled = false;
                        play.click();
                    }
                }
            }
            displayTimeLeft(secondsLeft);
        }, 1000);
    });
}

function sessionBreakSelect(sessionTime, breakTime) {
    // TODO: pop up warning if timer has started
    sessionTime.addEventListener('click', () => {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        breakSelected = false;
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds);
        if (sessionTimeSelected) null;
        else if (breakTimeSelected) {
            breakTimeSelected = false;
            sessionTimeSelected = true;
            titleBorderChange();
        }
    });
    breakTime.addEventListener('click', () => {
        if (timerStarted) stopTimerHard(stop, sessionSeconds);
        breakSelected = true;
        sessionSeconds = parseInt(breakMinutes.textContent) * 60;
        displayTimeLeft(sessionSeconds, false);
        timerDisplay(sessionSeconds, false);
        if (breakTimeSelected) null;
        else if (sessionTimeSelected) {
            breakTimeSelected = true;
            sessionTimeSelected = false;
            titleBorderChange();
        }
    });
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
    increase.addEventListener('click', () => {
        if (parseInt(minutes.textContent) >= 6000) return;
        else {
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
    });
    decrease.addEventListener('click', () => {
        if (parseInt(minutes.textContent) <= 1) return;
        else {
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

function pauseTimer(pause) {
    pause.disabled = true;

    pause.addEventListener('click', () => {
        clearInterval(countdown);
        sessionTitle.classList >= 1 ? timerDisplay(0) : timerDisplay(0, false);
        pause.disabled = true;
        play.disabled = false;
    });
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

    stop.addEventListener('click', () => {
        if (breakSelected && pomodorosCount !== 4) seconds = parseInt(breakMinutes.textContent) * 60;
        else if (pomodorosCount === 4) seconds = longBreak;
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
        if (breakSelected) timerDisplay(seconds, false);
        else timerDisplay(seconds);
    });
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
    timerDisplay(seconds);
}

function resetPomodoros(pomodoros) {
    pomodoros.forEach((pomodoro) => {
        if (!customThemeActive) {
            const pomodoroBorder = pomodoro.classList[1];
            pomodoro.classList = '';
            pomodoro.classList.add('pomodoro');
            pomodoro.classList.add(pomodoroBorder);
        } else {
            pomodoro.classList = '';
            pomodoro.classList.add('pomodoro');
            pomodoro.style.backgroundColor = '';
        }
    });
}

function resetTimer(reset) {
    reset.addEventListener('click', () => {
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
        timerDisplay(parseInt(timer.textContent.split(':')[0]) * 60);
    });
}

function mainTimer() {
    timerDisplay(sessionSeconds);
    timerSession(increaseSession, sessionMinutes, decreaseSession);
    timerSession(increaseBreak, breakMinutes, decreaseBreak, false);
    sessionBreakSelect(sessionTitle, breakTitle);
    pauseTimer(pause);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
}

window.onload = mainTimer();