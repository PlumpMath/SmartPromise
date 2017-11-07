/// <binding BeforeBuild='build' Clean='clean' />
var gulp = require('gulp'),
    jsminify = require("gulp-minify")
    cssmin = require('gulp-clean-css')
    rename = require('gulp-rename')
    concatJs = require('gulp-concat')
    concatCss = require('gulp-concat-css')
    gulpSequence = require('gulp-sequence')
    clean = require('gulp-clean')

gulp.task("min:js", function () {
    return gulp.src(["./wwwroot/js/*.js", "!" + "./wwwroot/js/*.min.js"], { base: "." })
        .pipe(concatJs("./wwwroot/js/out/bundle.js"))
        .pipe(jsminify())
        .pipe(rename(function (opt) {
            opt.basename = opt.basename.replace('-min', '.min');
            return opt;
        }))
        .pipe(gulp.dest("."))
})

gulp.task("concat:css", function () {
    return gulp.src(["./wwwroot/css/*.css", "!" + "./wwwroot/css/*.min.css"], { base: "." })
        .pipe(concatCss("./wwwroot/css/out/bundle.css"))
        .pipe(gulp.dest("."))
})

gulp.task("min:bundlecss", function () {
    return gulp.src("./wwwroot/css/out/bundle.css", { base: "." })
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest("."))
})

gulp.task('min:css', gulpSequence('concat:css', 'min:bundlecss'))

gulp.task('clean', function () {
    return gulp.src(['./wwwroot/css/out', "./wwwroot/js/out"], { read: false })
        .pipe(clean());
});

gulp.task('build', ['min:css', 'min:js'])
