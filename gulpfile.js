const { src, dest, watch, parallel, series } = require('gulp');

const include      = require('gulp-include');
const scss         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat');
const browserSynk  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');

// ==== HTML ====
function html() {
    return src('app/pages/*.html')
 
      .pipe(include({
        includePaths: 'app/components'
      }))
    
      .pipe(dest('app'))
      .pipe(browserSynk.stream())
}

// ==== SCSS ====
function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSynk.stream())
}

// ==== IMG ====
function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 7 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

// ==== Script ====
function scripts() {
    return src([
        // 'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())

        .pipe(dest('app/js'))
        .pipe(browserSynk.stream())
}

// ==== DEL ====
function cleanDist() {
    return del('dist')
}

// ==== Build ====
function build() {
    return src([
        'app/*.html',
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/images/**/*',
        'app/js/main.min.js'
        
    ], { base: 'app' })
        .pipe(dest('dist'))
}

// ==== BROWSER-SYNK ====
function browsersynk() {
    browserSynk.init({
        server: {
            baseDir: 'app/'
        }
    });
}

// ==== WATC ====
function watching() {
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)

    watch(['app/*.html']).on('change', browserSynk.reload)
    watch(['app/components/*', 'app/pages/*}'], html)

}

// ==== EXPORTS ====
exports.html         = html;
exports.styles       = styles;
exports.images       = images;
exports.scripts      = scripts;
exports.autoprefixer = autoprefixer;
exports.cleanDist    = cleanDist;
exports.browsersynk  = browsersynk;
exports.watching     = watching;

exports.build   = series(images, cleanDist,  build);
exports.default = parallel(styles, scripts, browsersynk, html, watching);

// ==== npm i(начаало работы) ====

// ==== gulp(просто запуск) ====
// ==== gulp build(сборка в папку dist) ====
