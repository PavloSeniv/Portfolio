//Початок коду для додавання webp формату у css
@@include('WebpAddClassToHtml.js')
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