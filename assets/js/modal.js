const modal = document.querySelector("#simple-modal");
const modalBtn = document.querySelector("#modal-btn");
const closeBtn = document.querySelectorAll(".close-btn")[0];
const themes = document.querySelectorAll(".theme");
const body = document.querySelector("body");
const themeColor = document.querySelectorAll(".dark-color");
const themeBorder = document.querySelectorAll(".dark-border");
let themeActive = document.querySelector(".dark-active");
const themeTitle = document.querySelector(".dark-title");

function modalDisplay(modal, modalBtn, closeBtn) {
  modalBtn.addEventListener("click", () => {
    modal.classList.add("show-modal");
    settings.style.transform = "rotate(90deg)";
    settings.blur();
  });
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show-modal");
    settings.style.transform = "rotate(0deg)";
  });
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show-modal");
      settings.style.transform = "rotate(0deg)";
    }
  });
}

function changeTheme(themes) {
  themes.forEach(theme => {
    theme.addEventListener("click", function () {
      body.classList = "";
      body.classList.add(this.classList[1]);
      themeColor.forEach(element => {
        element.classList.remove(element.classList[element.classList.length - 1]);
        element.classList.add(`${this.classList[1]}-color`);
      });
      themeBorder.forEach(element => {
        element.classList.remove(element.classList[element.classList.length - 1]);
        element.classList.add(`${this.classList[1]}-border`);
      });
      /* FIXME: 
         Switching themes while "break" is active will result in underlines on both
         titles
      */
      themeActive.classList.remove(themeActive.classList[themeActive.classList.length - 1]);
      themeActive.classList.add(`${this.classList[1]}-active`);
      themeActive = document.querySelector(`.${this.classList[1]}-active`);
      themeTitle.classList.remove(themeTitle.classList[themeTitle.classList.length - 1]);
      themeTitle.classList.add(`${this.classList[1]}-title`);
    });
  });
}

function main() {
  modalDisplay(modal, modalBtn, closeBtn);
  changeTheme(themes);
}

window.onload = main();