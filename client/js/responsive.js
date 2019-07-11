const timerFontMediaQueryMinute = window.matchMedia('(max-width: 420px)');
const timerFontMediaQueryMax = window.matchMedia('(max-width: 675px)');

/**
 * Changes font size for small screens on large time quantities.
 * Prevents overflow.
 * 
 * @param {media query} e 
 * @return {void}
 */
function timerFontListenerMinute(minute) {
    if (minute.matches) {
        if (sessionSeconds === 360000) {
            timer.style.fontSize = '4.5rem';
            timer.setAttribute('style', 'font-size: 5rem; margin: 24px 0;');
        } else if (sessionSeconds >= 3600) {
            timer.style.fontSize = '5rem';
            timer.setAttribute('style', 'font-size: 5rem; margin: 24px 0;');
        } else {
            timer.setAttribute('style', 'font-size: 8rem;')
        }
    }
}

/**
 * @param {media query} max
 * @return {void}
 */
function timerFontListenerMax(max) {
    if (max.matches) {
        if (sessionSeconds === 360000) timer.style.fontSize = '17.5vw';
        else if (sessionSeconds >= 3600) timer.style.fontSize = '20vw';
        else timer.style.fontSize = '8rem';
    } else {
        timer.style = '';
    }
}

function mediaQueryListener() {
    timerFontMediaQueryMinute.addListener(timerFontListenerMinute);
    timerFontListenerMinute(timerFontMediaQueryMinute);
    timerFontMediaQueryMax.addListener(timerFontListenerMax);
    timerFontListenerMax(timerFontMediaQueryMax);
}

window.onload = mediaQueryListener();