const timerFontMediaQuery = window.matchMedia('(max-width: 420px)');

function timerFontListener(e) {
    if (e.matches) {
        if (sessionSeconds === 360000) timer.style.fontSize = '4.688rem';
        else if (sessionSeconds >= 3600) timer.style.fontSize = '5rem';
    } else timer.style.fontSize = '5.625rem';
}

function mediaQueryListener() {
    timerFontMediaQuery.addListener(timerFontListener);
    timerFontListener(timerFontMediaQuery);
}

window.onload = mediaQueryListener();