const gulp        	= require('gulp'),
      gutil         = require('gulp-util'),
      concat      	= require('gulp-concat'),
      buffer      	= require('vinyl-buffer'),
      uglify      	= require('gulp-uglify-es').default;

const resourcePath = './resources/';

gulp.task('js', () => {
    gulp.src([
        resourcePath + '*.js',
        resourcePath + '**/*.js',
    ])
        .pipe(buffer())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(uglify().on('error', gutil.log))
        .pipe(concat('dd.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', () => {
    gulp.watch([resourcePath + '*.js', resourcePath + '**/*.js'], ['js']);
});
