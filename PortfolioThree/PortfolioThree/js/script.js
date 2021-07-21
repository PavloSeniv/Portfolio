//Початок коду для додавання webp формату у css
// JS-функція визначення підтримки WebP
function testWebP(callback) {

    var webP = new Image();
    webP.onload = webP.onerror = function () {
        callback(webP.height === 2);
    };
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {

    if (support === true) {
        document.querySelector('body').classList.add('webp');
    } else {
        document.querySelector('body').classList.add('no-webp');
    }
});
//Кінець

    /*==================================== MENU SHOW Y HIDDEN ===============================*/
const navMenu = document.getElementById('Nav__Menu'),
    navToggle = document.getElementById('Nav__Toggle'),
    navClose = document.getElementById('Nav__Close')

/*=========== MENU SHOW ==========*/
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('Show__Menu')
    })
}

/*=========== MENU HIDDEN ==========*/
/* Validate if constant exists */
if (navClose) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.remove('Show__Menu')
    })
}