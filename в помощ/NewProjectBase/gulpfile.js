'use strict';

const gulp           = require('gulp'),
      gulpsync       = require('gulp-sync')(gulp),
      preprocess     = require('gulp-preprocess'),
      del            = require('del'),
      vinylPaths     = require('vinyl-paths'),
      sass           = require('gulp-sass'),
      sourcemaps     = require('gulp-sourcemaps'),
      uglify         = require('gulp-uglify'),
      concat         = require('gulp-concat'),
      copy           = require('gulp-contrib-copy'),
      watch          = require('gulp-watch'),
      browserSync    = require('browser-sync'),
      imagemin       = require('gulp-imagemin'),
      pngquant       = require('imagemin-pngquant'),
      plumber        = require('gulp-plumber'),
      autoprefixer   = require('gulp-autoprefixer'),
      notify         = require("gulp-notify"),
      debug          = require("gulp-debug"),
      spritesmith    = require('gulp.spritesmith'),
      babel          = require('gulp-babel'),
      htmlmin        = require('gulp-htmlmin');
    // gulpRemoveHtml = require("gulp-remove-html"),
    // pug            = require("gulp-pug"),
    // cache          = require('gulp-cached');
    // useref         = require('gulp-useref');

// ----========= Paths:
var path = {
        build: {
            root     : 'build/',
            html     : 'build/*.html',
            js       : 'build/js/',
            css      : 'build/css/',
            img      : 'build/img/',
            fonts    : 'build/fonts/',
        },
        src: {
            root    : 'src/',
            pug     : 'src/pug/pages/**/*.pug',
            html    : 'src/html/**/*.html',
            sass    : 'src/styles/main.sass',
            css     : 'src/styles/',
            lib     : 'src/lib/**/*.js',
            js      : 'src/js/**/*.js',
            scripts : 'src/scripts/**/*.js',
            img     : 'src/img/**/*.*',
            fonts   : 'src/fonts/**/*',
            php     : 'src/php/**/*'
        },
        watch: {
            html: 'src/html/**/*.html',
            // pug:  'src/pug/**/*.pug',
            sass: 'src/styles/**/*.sass',
            js:   'src/js/**/*.js',
            tpl:  'src/tpl/**/*.html'
        },
        clean: ['build', 'src/styles/main.css', 'src/*.html']
};

// ----========= Initialize Local Server
var webserver = {
    dev: {
        server: {
            baseDir: './src'
        },
        notify: true,
        // tunnel: true,
        host: 'localhost',
        port: 9011,
        logPrefix: 'app_dev'
    },
    prod: {
        server: {
            baseDir: './build'
        },
        notify: true,
        // tunnel: true,
        host: 'localhost',
        port: 9012,
        logPrefix: 'app_prod'
    }
};

// ----========= Remove folders task
gulp.task('del', function () {
    return gulp.src(path.clean)
      .pipe(vinylPaths(del));
    //   .pipe(gulp.dest('dist'));
  });

// ----========= Pug to HTML
    // development:
// gulp.task('pug:dev', function () {
//     return gulp.src(path.src.pug)
//         .pipe(debug({title: 'Pug:'}))
//         .pipe(plumber())
//         .pipe(pug({pretty: true}).on("error", notify.onError()))
//         .pipe(cache('pugToHTML'))
//         .pipe(gulp.dest(path.src.root))
//         .pipe(browserSync.reload({stream: true}));
// });
// // ----========= Remove useless scripts from HTML:
// gulp.task('deject', function () {
//     return gulp.src(path.build.html)
//     .pipe(gulpRemoveHtml())
//     .pipe(gulp.dest(path.build.root))
// });

// // ----========= Pug to HTML:
// // production:
// gulp.task('pug:prod', function () {
//     return gulp.src(path.src.pug)
//         .pipe(gulpRemoveHtml().on("error", notify.onError()))
//         .pipe(pug().on("error", notify.onError()))
//         .pipe(gulp.dest(path.build.root));
// });

// ----=========Препроцессинг html
// development
gulp.task('html:dev', function() {
    gulp.src(path.src.html)
        .pipe(preprocess({context: {NODE_ENV: 'development', DEBUG: true}}))
        // .pipe(htmlmin())
        .pipe(gulp.dest(path.src.root))
        .pipe(browserSync.reload({stream: true}));
});
// production
gulp.task('html:prod', function() {
    gulp.src(path.src.html)
        .pipe(preprocess({context: {NODE_ENV: 'production', DEBUG: true}}))
        .pipe(htmlmin({collapseWhitespace: true, collapseInlineTagWhitespace: true}))
        .pipe(gulp.dest(path.build.root))
});

// ----========= Sass
// development
gulp.task('sass:dev', function() {
    return gulp.src(path.src.sass)
        .pipe(debug({title: 'Sass: '}))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", notify.onError()))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.src.css))
        .pipe(browserSync.reload({stream: true}));
});
// production
gulp.task('sass:prod', function() {
    return gulp.src(path.src.sass)
        .pipe(sass({outputStyle: 'compressed'}).on("error", notify.onError()))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(path.build.css));
});

// ----========= Copying fonts, php, for production
gulp.task('copy:miscellaneous', function() {
    gulp.src(path.src.fonts)
        .pipe(copy())
        .pipe(gulp.dest(path.build.fonts));
    gulp.src(path.src.php)
        .pipe(copy())
        .pipe(gulp.dest(path.build.root));
});

// ----========= Images optimize
gulp.task('img', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});

// ----========= JavaScript

// Concatenate all the JS-files for Production. Folders to contat: js, scripts
gulp.task('scripts:prod', function() {
    return gulp.src([path.src.lib, path.src.js, path.src.scripts]) // path.src.lib, path.src.js, path.src.scripts
        // .pipe(useref())
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js));
});

// ----========= Watch
gulp.task('watch', function(){
    // watch([path.watch.pug], function() {
    //     gulp.start('pug:dev');
    // });
    watch([path.watch.html], function() {
        gulp.start('html:dev');
    });
    watch([path.watch.sass], function() {
        gulp.start('sass:dev');
    });
    watch([path.watch.js]).on('change', browserSync.reload);
});

// ----========= Starting local server
// development
gulp.task('webserver:dev', function () {
    browserSync(webserver.dev);
});
// production
gulp.task('webserver:prod', function () {
    browserSync(webserver.prod);
});

// ----========= DEVELOPER BUILD
gulp.task('dev', gulpsync.sync([
    'del',
    [
        'html:dev',
        'sass:dev',
    ],
    'watch',
    'webserver:dev'
]));

// ----========= PRODUCTION BUILD
gulp.task('prod', gulpsync.sync([
    'del',
    [
        'html:prod',
        'sass:prod',
        'copy:miscellaneous',
        'img',
        'scripts:prod'
    ],
    'deject'
]));

// ----========= Sprite-generator
gulp.task('sprite', function () {
    var spriteData = gulp.src('files/Sprite/*.png').pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css'
    }));
    return spriteData.pipe(gulp.dest('files/sprite/build/'));
  });

gulp.task('default', ['dev']);
