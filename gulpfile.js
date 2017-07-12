'use strict';

/**
 * Module dependencies.
 */
const gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins();


// ESLint JS linting task
gulp.task('eslint', function () {
  const assets = './lib/**.js';

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

// Mocha tests task
gulp.task('mocha', function (done) {
  const testSuites = './test/**.spec.js';
  let error;

  // Run the tests
  gulp.src(testSuites)
    .pipe(plugins.mocha({
      reporter: 'spec',
      timeout: 10000
    }))
    .on('error', function (err) {
      // If an error occurs, save it
      error = err;
    })
    .on('end', function () {
        done(error);
    });
});
