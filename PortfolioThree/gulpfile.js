let project_folder = require("path").basename(__dirname);
let source_folder = "#src";

let fs = require("fs"); //file system

let path = {
    // Папка dist(видається замовнику)
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/"
    },
    //Папка із початковими файлами
    src: {
        // Виключення всіх файлів html які починаються з _ із папки dist
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        /*
                css: source_folder + "/css/styleOne.css",
        */
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        /*
                img: source_folder + "/img/!**!/!*.{jpg,png,svg,gif,ico,webp}",
        */
        //Якщо не  вказати розширення також іх верхнього регістру то можливий варіант не копіювання зображення
        img: source_folder + "/img/**/*.+(png|PNG|jpg|JPG|gif|ico|svg|webp)",
        fonts: source_folder + "/fonts/*.ttf"
    },
    //Об'єкт  для слідкування за файлами в реальному часі(browserSync)
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}
//Оголошуємо всі плагіни
let {src, dest} = require('gulp'),
    gulp = require('gulp'), //Ініціалізація gulp
    browsersync = require("browser-sync").create(),// Для плагіна browser-sync
    fileinclude = require("gulp-file-include"), // Для об'єднання декількох html файлів в єдиний index.html
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"), // Для збирання всіх медіа запитів в кінець файлу
    clean_css = require("gulp-clean-css"), //Очищення та зжимання css файлу
    rename = require("gulp-rename"), //Для перейменування css файлу(переважно .min.css
    uglify = require("gulp-uglify-es").default, //Оптимізація js
    /*
    // Можна встановити такий плагін додатково
    babel = require("gup-babel");
    */
    imagemin = require("gulp-imagemin"), //Оптимізація зображень
    webp = require("gulp-webp"), //Для перетворення зображень у формат webp
    webphtml = require("gulp-webp-html"), //Інтеграція webp в html
/*
    webpcss2 = require("gulp-webp-css"),//Інтеграція webp в css(правильний варіант)
*/
    svgSprite = require("gulp-svg-sprite"),//Створення svg спрайтів
    ttf2woff = require("gulp-ttf2woff"),//Конвертація шрифтів
    ttf2woff2 = require("gulp-ttf2woff2"),//Конвертація шрифтів
    fonter = require("gulp-fonter");//Конвертація шрифтів з otf формату

//Функція для плагіна browserSync
function
browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: true
    })
}

//Копіювання index.html з src до dist(якщо папки немає, вона створится gulp)
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        /*//Не потрібно для scss
        .pipe(fileinclude())*/
        //Для scss файлів
        .pipe(
            scss({
                outputStyle: "expanded" // Для формування файлу не стисненим
            })
        )
        .pipe(
            autoprefixer({
                overrideBrowserlist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(
            group_media()
        )
/*
        .pipe(webpcss2())
*/
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

//Копіювання .js з src до dist(якщо папки немає, вона створится gulp)
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

//Робота із зображеннями
function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{remoteViewBox: false}],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));

}

gulp.task("otf2ttf", function () {
    return src([source_folder + "/fonts/*.otf"])
        .pipe(fonter({
                formats: ['ttf']
            })
        )
        .pipe(dest(source_folder + "/fonts/"));
})

//Окреме завдання для створення svg спрайтів
// gulp svgSprite in terminal
gulp.task("svgSprite", function () {
    return gulp.src([source_folder + "/iconsprite/*.svg"])
        .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../icons/icons.svg", //sprite file name
                        example: true
                    }
                },
            }
        ))
        .pipe(dest(path.build.img))
})

// Для автоматичного запису шрифтів в css
function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', callBack);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', callBack);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function callBack() {
}

//Слідкування за файлами в реальному часі
function watchFiles(params) {
    gulp.watch([path.watch.html], html); //Для html
    gulp.watch([path.watch.css], css); // Для css
    gulp.watch([path.watch.js], js); // Для js
    gulp.watch([path.watch.img], images); // Для img

}
//Для очищення пореднього білду проекту
function clean(params) {
    return del(path.clean); //Видалення попередньої папки з результатом
}

//Процес виконання
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle); //тут присутній варіант запису шрифтів
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;