/**
 * Keeps timer responsive on high time quantities for small screens.
 */

// Media queries for small width screens
const timerFontMediaQueryMin = window.matchMedia('(max-width: 420px)');
const timerFontMediaQueryMax = window.matchMedia('(max-width: 675px)');

/**
 * Adjust fontSize when min width is satisfied.
 * @param   {media query} min
 * @returns {undefined}
 */
function timerFontListenerMin(min) {
    if (min.matches) {
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
 * Adjust fontSize when max width is satisfied.
 * @param   {media query} max - Max width where the fontSize is applied
 * @returns {undefined}
 */
function timerFontListenerMax(max) {
    if (max.matches) {
        if (sessionSeconds === 360000) {
            timer.style.fontSize = '17.5vw';
        } else if (sessionSeconds >= 3600) {
            timer.style.fontSize = '20vw';
        } else {
            timer.style.fontSize = '8rem';
        }
    } else {
        timer.style = '';
    }
}

/**
 * Run media query listeners.
 */
function mediaQueryListener() {
    // Min
    timerFontMediaQueryMax.addListener(timerFontListenerMin);
    timerFontListenerMin(timerFontMediaQueryMin);
    // Max
    timerFontMediaQueryMax.addListener(timerFontListenerMax);
    timerFontListenerMax(timerFontMediaQueryMax);
}

window.onload = mediaQueryListener();