const { src, dest } = require('gulp');
const babel = require('gulp-babel');

exports.default = function() {
    return src('./src/**/*.js')
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(dest('lib'));
}