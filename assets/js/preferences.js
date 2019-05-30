// function checkAutoStart() {
//     autoStart.addEventListener('click', function () {
//         if (timerStarted) {
//             this.disabled = true;
//             timerRestartAutoStart(acceptRestart, declineRestart, themeWarningBackground);
//         }
//         else {
//             this.disabled = false;
//             hideModal(modal, settings);
//         }
//     });
// }

// function timerRestartAutoStart(accept, decline, themeWarning) {
//     themeWarning.style.display = 'block';
//     accept.addEventListener('click', () => {
//         autoStart.disabled = false;
//         stop.click();
//         themeWarning.style.display = 'none';
//     });
//     decline.addEventListener('click', () => {
//         themeWarning.style.display = 'none';
//     });
//     window.addEventListener('click', function (e) {
//         if (e.target === themeWarning) themeWarning.style.display = 'none';
//     });
// }

// function main() {
//     checkAutoStart();
// }

// window.onload = main();