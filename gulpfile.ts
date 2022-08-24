// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
// const ts = require('gulp-typescript');
// const babe
exports.default = function() {
  return src('./src/**/*.ts')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel({
      presets: [
        ['@babel/env',{
          modules: false
        }],
        ['@babel/preset-typescript', {
          allowNamespaces: true,
          allowDeclareFields: true
        }]
      ],
      plugins: [
        ['@babel/plugin-proposal-decorators', {
          legacy: true
        }]
      ]
    }))
    .pipe(dest('lib'));
};
