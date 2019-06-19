const timerFontMediaQuery = window.matchMedia('(max-width: 420px)');

function timerFontListener(e) {
    if (e.matches) {
        if (sessionSeconds === 6000) timer.style.fontSize = '75px';
        else if (sessionSeconds >= 3600) timer.style.fontSize = '80px';
    } else timer.style.fontSize = '90px';
}

function mediaQueryListener() {
    timerFontMediaQuery.addListener(timerFontListener);
    timerFontListener(timerFontMediaQuery);
}

window.onload = mediaQueryListener();