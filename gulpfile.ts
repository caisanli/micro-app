const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');

exports.default = function() {
  return src('./src/**/*.ts')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(ts({
      declaration: true,
    }))
    .pipe(babel({
      presets: [
        ['@babel/env',{
          modules: false
        }]
      ]
    }))
    .pipe(dest('lib'));
};
