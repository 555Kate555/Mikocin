const {watch, series, src, dest} = require("gulp");
const fs = require('fs');
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const browserSync = require("browser-sync");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const del = require("del");



function server() {
    browserSync({
        server:{
            baseDir: 'dist'
        },
        notify:false
    });
}

function files() {
    return src(['./src/index.html'])
        .pipe(dest('./dist/'));
}

function css() {
    return src('./src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(cleanCSS({level:2}))
        .pipe(autoprefixer(["last 15 versions", ">0.2%"], {cascade:true}))
        .pipe(rename({suffix:'.min'}))
        .pipe(dest('./dist/css'))
        .pipe(browserSync.reload({stream:true}));
}

function cssBuild() {
    return src('./src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer(["last 15 versions", ">0.2%"], {cascade:true}))
        .pipe(dest('./dist/css'))
}

const cssLibsList = [
    './node_modules/normalize.css/normalize.css'
]

function cssLibs() {
    return src(cssLibsList)
        .pipe(concat('libs.css'))
        .pipe(cleanCSS({level:2}))
        .pipe(rename({suffix:'.min'}))
        .pipe(dest('./dist/css'));
}

function cssLibsBuild() {
    return src(cssLibsList)
        .pipe(dest('./dist/css'));
}

function getImg() {
    return src('src/images/**/*')
        .pipe(dest('dist/images'));
};

function getFonts() {
    return src('src/fonts/**/*')
        .pipe(dest('dist/fonts'));
};

function linkMiniFieldFiles(cb) {
    let indexHTML = fs.readFileSync('src/index.html', 'utf8');
    indexHTML = indexHTML.replace(/libs.css/g, 'libs.min.css');
    indexHTML = indexHTML.replace(/style.css/g, 'style.min.css');

    fs.mkdirSync('dist');
    fs.writeFileSync('./dist.index.html', indexHTML);

    cb();
}

function clean(cb) {
    if(fs.existsSync('dist/**', '!dist')) {
        const files = fs.readdirSync('dist/**', '!dist');

        files.forEach(f=> {
            fs.unlinkSync(`./dist/**${f}`);
        });

        fs.rmdirSync('dist/**', '!dist');
    }

    cb();
};

function bootstrap(cb) {
    clean(cb);
    files();
    css();
    cssLibs();
    server();
    getImg();
    getFonts();
}

function watchFiles() {
    watch('./src/index.html', function() {
        return src('./src/index.html')
            .pipe(dest('./dist'))
            .pipe(browserSync.reload({stream:true}));
    });
    watch('./src/sass/**/*.scss', css);
}

if(process.env.NODE_ENV === 'production') {
    exports.build = series(clean,linkMiniFieldFiles, cssBuild, cssLibsBuild);
} else {
    exports.build = series(clean, css, cssLibs, files);
}

exports.default = series(bootstrap, watchFiles);