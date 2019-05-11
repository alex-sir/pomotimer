let countdown;
const timer = document.querySelector("#timer");
const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
const stop = document.querySelector("#stop");
const reset = document.querySelector("#reset");
const arrow = document.querySelectorAll(".arrow");
const increaseSession = document.querySelector("#increase-session");
const sessionMinutes = document.querySelector("#session-minutes");
let sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
const decreaseSession = document.querySelector("#decrease-session");
const increaseBreak = document.querySelector("#increase-break");
const breakMinutes = document.querySelector("#break-minutes");
const decreaseBreak = document.querySelector("#decrease-break");

function timerDisplay(seconds, breakTime = true) {
    play.addEventListener("click", () => {
        seconds = sessionSeconds;
        clearInterval(countdown);
        play.style.pointerEvents = "none";
        pause.style.pointerEvents = "auto";
        stop.style.pointerEvents = "auto";
        arrow.forEach(arrow => {
            arrow.style.pointerEvents = "none";
        });
        const now = Date.now();
        const then = now + seconds * 1000;
        displayTimeLeft(seconds);

        countdown = setInterval(() => {
            const secondsLeft = Math.round((then - Date.now()) / 1000);
            sessionSeconds -= 1;

            if (secondsLeft < 1) {
                clearInterval(countdown);
                if (breakTime) {
                    sessionSeconds = parseInt(breakMinutes.textContent) * 60;
                    timerDisplay(sessionSeconds, false);
                    play.style.pointerEvents = "auto";
                    play.click();
                } else {
                    sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
                    timerDisplay(sessionSeconds);
                    play.style.pointerEvents = "auto";
                    play.click();
                }
            }
            displayTimeLeft(secondsLeft);
        }, 1000);
    });
}

function timerSession(increase, minutes, decrease, session = true) {
    increase.addEventListener("click", () => {
        if (parseInt(minutes.textContent) >= 5940) return;
        else {
            minutes.textContent = parseInt(minutes.textContent) + 1;
            if (session) {
                displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds += 60;
            }
        }
    });
    decrease.addEventListener("click", () => {
        if (parseInt(minutes.textContent) <= 1) return;
        else {
            minutes.textContent = parseInt(minutes.textContent) - 1;
            if (session) {
                displayTimeLeft(parseInt(minutes.textContent) * 60, false);
                sessionSeconds -= 60;
            }
        }
    });
}

function displayTimeLeft(seconds, title = true) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    const display = `${minutes < 10 ? minutes.toString().padStart(2, 0) : minutes}:${
        remainderSeconds < 10 ? remainderSeconds.toString().padStart(2, 0) : remainderSeconds}`;
    timer.textContent = display;
    if (!title) return
    else document.title = `(${display}) Pomodoro`;
}

function pauseTimer(pause) {
    pause.style.pointerEvents = "none";

    pause.addEventListener("click", () => {
        const time = timer.textContent.split(":");
        const seconds = (parseInt(time[0]) * 60) + parseInt(time[1]);

        clearInterval(countdown);
        timerDisplay(seconds);
        pause.style.pointerEvents = "none";
        play.style.pointerEvents = "auto";
    });
}

function stopTimer(stop, seconds) {
    stop.style.pointerEvents = "none";

    stop.addEventListener("click", () => {
        seconds = parseInt(sessionMinutes.textContent) * 60;
        sessionSeconds = seconds;
        clearInterval(countdown);
        displayTimeLeft(seconds);
        stop.style.pointerEvents = "none";
        pause.style.pointerEvents = "none";
        play.style.pointerEvents = "auto";
        arrow.forEach(arrow => {
            arrow.style.pointerEvents = "auto";
        });
        document.title = "Pomodoro";
        timerDisplay(seconds);
    });
}

function resetTimer(reset) {
    reset.addEventListener("click", () => {
        clearInterval(countdown);
        timer.textContent = "25:00";
        sessionMinutes.textContent = "25";
        sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
        breakMinutes.textContent = "5";
        arrow.forEach(arrow => {
            arrow.style.pointerEvents = "auto";
        });
        play.style.pointerEvents = "auto";
        document.title = "Pomodoro";
    });
}

function main() {
    timerDisplay(sessionSeconds);
    timerSession(increaseSession, sessionMinutes, decreaseSession);
    timerSession(increaseBreak, breakMinutes, decreaseBreak, false);
    pauseTimer(pause);
    stopTimer(stop, sessionSeconds);
    resetTimer(reset);
}

window.onload = main();