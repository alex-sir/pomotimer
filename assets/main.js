let countdown;
const timerDisplay = document.querySelector("#timer");
const play = document.querySelector(".fa-play");
const pause = document.querySelector(".fa-pause");
const stop = document.querySelector(".fa-stop");

function timer(seconds) {
    play.addEventListener("click", () => {
        clearInterval(countdown);
        play.style.pointerEvents = "none";
        const now = Date.now();
        const then = now + seconds * 1000;
        displayTimeLeft(seconds);

        countdown = setInterval(() => {
            const secondsLeft = Math.round((then - Date.now()) / 1000);

            if (secondsLeft < 1) {
                clearInterval(countdown);
            }
            displayTimeLeft(secondsLeft);
        }, 1000);
    });
}

function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    const display = `${minutes < 10 ? minutes.toString().padStart(2, 0) : minutes}:${
        remainderSeconds < 10 ? remainderSeconds.toString().padStart(2, 0) : remainderSeconds}`;
    document.title = `(${display}) Pomodoro`;
    timerDisplay.textContent = display;
}

function pauseTimer(pause) {
    pause.addEventListener("click", () => {
        const time = timerDisplay.textContent.split(":");
        const seconds = (parseInt(time[0]) * 60) + parseInt(time[1]);

        clearInterval(countdown);
        timer(seconds);
        play.style.pointerEvents = "auto";
    });
}

function main() {
    timer(1500);
    pauseTimer(pause);
}

window.onload = main();