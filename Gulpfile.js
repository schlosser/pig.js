'use strict';

var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('js:build', function (done) {
  gulp.src(['./src/**/*.js', '!./src/**/*.min.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./src'));
  done();
});

gulp.task('js:lint', function (done) {
  gulp.src(['./src/**/*.js', '!./src/**/*.min.js', 'Gulpfile.js'])
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  done();
});

gulp.task('build', gulp.series(['js:lint', 'js:build']));

gulp.task('watch', function () {
  var watcher = gulp.watch(['./src/**/*.js', '!./src/**/*min*.js'], gulp.parallel('build'));
  watcher.on('change', function (path, stats) {
    console.log('File ' + path + ' was changed');
  });
});
