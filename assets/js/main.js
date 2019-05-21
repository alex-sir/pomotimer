let countdown;
const timer = document.querySelector("#timer");
const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
const stop = document.querySelector("#stop");
const reset = document.querySelector("#reset");
const arrow = document.querySelectorAll(".arrow");
const settings = document.querySelector(".settings");
const pomodoros = document.querySelectorAll(".pomodoro");
let pomodorosCount = 0;
const sessionTitle = document.querySelector(".session-title h3");
const increaseSession = document.querySelector("#increase-session");
const sessionMinutes = document.querySelector("#session-minutes");
let sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
const breakTitle = document.querySelector(".break-title h3");
const decreaseSession = document.querySelector("#decrease-session");
const increaseBreak = document.querySelector("#increase-break");
const breakMinutes = document.querySelector("#break-minutes");
const decreaseBreak = document.querySelector("#decrease-break");

function timerDisplay(seconds, breakTime = true) {
  play.addEventListener("click", () => {
    seconds = sessionSeconds;
    clearInterval(countdown);
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
      sessionSeconds -= 1;

      if (secondsLeft < 1) {
        clearInterval(countdown);
        let currentActive;
        sessionTitle.classList.length >= 1 ?
          currentActive = sessionTitle.classList[sessionTitle.classList.length - 1] :
          currentActive = breakTitle.classList[breakTitle.classList.length - 1];
        breakTitle.classList.toggle(currentActive);
        sessionTitle.classList.toggle(currentActive);
        if (pomodorosCount === 4) {
          pomodorosCount = 0;
          pomodoros.forEach((pomodoro) => {
            pomodoro.style.backgroundColor = "";
          });
          sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
          timerDisplay(sessionSeconds);
          play.disabled = false;
          play.click();
        } else if (breakTime) {
          pomodorosCount++;
          pomodoros[pomodorosCount - 1].style.backgroundColor = "#e8e8e8";
          pomodorosCount === 4 ?
            sessionSeconds = Math.min((parseInt(breakMinutes.textContent) * 60) * 3, 6000) :
            sessionSeconds = parseInt(breakMinutes.textContent) * 60;
          timerDisplay(sessionSeconds, false);
          play.disabled = false;
          play.click();
        } else {
          sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
          timerDisplay(sessionSeconds);
          play.disabled = false;
          play.click();
        }
      }
      displayTimeLeft(secondsLeft);
    }, 1000);
  });
}

function timerSession(increase, minutes, decrease, session = true) {
  increase.addEventListener("click", () => {
    if (parseInt(minutes.textContent) >= 6000) return;
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

  pause.addEventListener("click", () => {
    clearInterval(countdown);
    sessionTitle.classList >= 1 ? timerDisplay(0) : timerDisplay(0, false);
    pause.disabled = true;
    play.disabled = false;
  });
}

function stopTimer(stop, seconds) {
  stop.disabled = true;

  stop.addEventListener("click", () => {
    seconds = parseInt(sessionMinutes.textContent) * 60;
    sessionSeconds = seconds;
    clearInterval(countdown);
    displayTimeLeft(seconds);
    if (breakTitle.classList.length >= 1) {
      sessionTitle.classList.add(breakTitle.classList[breakTitle.classList.length - 1]);
      breakTitle.classList = "";
    }
    pomodoros.forEach((pomodoro) => {
      pomodoro.style.backgroundColor = "";
    });
    pomodorosCount = 0;
    stop.disabled = true;
    pause.disabled = true;
    play.disabled = false;
    arrow.forEach(arrow => {
      arrow.disabled = false;
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
    if (breakTitle.classList.length >= 1) {
      sessionTitle.classList.add(breakTitle.classList[breakTitle.classList.length - 1]);
      breakTitle.classList = "";
    }
    pomodoros.forEach((pomodoro) => {
      pomodoro.style.backgroundColor = "";
    });
    pomodorosCount = 0;
    sessionSeconds = parseInt(sessionMinutes.textContent) * 60;
    breakMinutes.textContent = "5";
    arrow.forEach(arrow => {
      arrow.disabled = false;
    });
    play.disabled = false;
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