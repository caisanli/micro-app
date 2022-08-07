const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

exports.default = function() {
  return src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel({
      presets: [
        ['@babel/env',{
          modules: false
        }]
      ]
    }))
    .pipe(dest('lib'));
};
