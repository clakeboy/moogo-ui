/**
 * Created by CLAKE on 2016/8/7.
 */
import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
// import webpackConfig from './webpack.config';
// import webpackConfigDev from './webpack.dev.config';
import gutil from 'gulp-util';
import pkg from './package.json';

import historyApiFallback from 'connect-history-api-fallback';

const $ = gulpLoadPlugins();

const banner = `/** ${pkg.title} v${pkg.version} | by Clake
  * (c) ${$.util.date(Date.now(), 'UTC:yyyy')} Clake,
  * ${$.util.date(Date.now(), 'isoDateTime')}
  */
  `;

const paths = {
    jsEntry: 'src/app.jsx',
    dist: 'dist'
};

const replaceVersion = function() {
    return $.replace('__VERSION__', pkg.version);
};

const addBanner = function() {
    return $.header(banner);
};

gulp.task('server', () => {
    let webpackConfigDev = require('./webpack.dev').default;
    const bundler = webpack(webpackConfigDev);
    const bs = browserSync.create();

    bs.init({
        logPrefix: 'AMT',
        server: {
            baseDir: ['app/ui'],
            middleware: [
                historyApiFallback(),
                webpackDevMiddleware(bundler, {
                    publicPath: '/',  //webpackConfig.output.publicPath,
                    stats: {colors: true},
                    lazy:false,
                    watchOptions:{
                        aggregateTimeout: 300,
                        poll: true
                    }
                }),
                webpackHotMiddleware(bundler)
            ]
        },
        ghostMode:false,
        codeSync:false
    });
});

gulp.task('clean', () => {
    return del([
        'app/ui/*',
        '!app/ui/vendor',
        '!app/ui/index.html',
        '!app/ui/manage.html',
        '!app/ui/static',
        '!app/ui/favicon.ico'
    ]);
});

gulp.task('build:pack', (callback)=>{
    let webpackConfig = require('./webpack.prod').default;
    webpack(webpackConfig,function(err,stats){
        gutil.log("[webpack]", stats.toString({
            colors:true
        }));
        callback();
    });
});

gulp.task('default', ['server']);

gulp.task('build',['clean','build:pack']);