const timerFontMediaQuery = window.matchMedia('(max-width: 420px)');

/**
 * Changes font size for small screens on large time quantities.
 * Prevents overflow.
 * 
 * @param {media query} e 
 * @return {void}
 */
function timerFontListener(e) {
    if (e.matches) {
        if (sessionSeconds === 360000) timer.style.fontSize = '4.5rem';
        else if (sessionSeconds >= 3600) timer.style.fontSize = '5rem';
    } else timer.style.fontSize = '8rem';
}

function mediaQueryListener() {
    timerFontMediaQuery.addListener(timerFontListener);
    timerFontListener(timerFontMediaQuery);
}

window.onload = mediaQueryListener();