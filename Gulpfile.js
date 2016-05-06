'use strict';

var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('js:build', function() {
  gulp.src(['./src/**/*.js', '!./src/**/*.min.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./src'));
});

gulp.task('js:lint', function() {
  gulp.src(['./src/**/*.js', '!./src/**/*.min.js', 'Gulpfile.js'])
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build', ['js:lint', 'js:build']);

gulp.task('watch', ['build'], function() {
  gulp.watch(['./src/**/*.js', 'Gulpfile.js'], ['build']);
});
