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

let argv = require('minimist')(process.argv.slice(2));

let platform = argv['p'] || 'mac';

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

gulp.task('clean', (callback) => {
    return del([
        'app/ui/*',
        '!app/ui/vendor',
        '!app/ui/index.html',
        '!app/ui/manage.html',
        '!app/ui/static',
        '!app/ui/favicon.ico'
    ],callback);
});

gulp.task('build:pack',['clean'], (callback)=>{
    let webpackConfig = require('./webpack.prod').default;
    webpack(webpackConfig,function(err,stats){
        gutil.log("[webpack]", stats.toString({
            colors:true
        }));
        callback();
    });
});

gulp.task('clean:electron-cmd',()=>{
    let ext;
    switch (platform) {
        case "linux":
            ext = '_linux';
            break;
        case 'win':
            ext = '.exe';
            break;
        case 'mac':
        default:
            ext = '_darwin';
    }
    let log = del.sync(['app/cmd/moogo.exe','app/cmd/moogo_darwin','app/cmd/moogo_linux']);
    gutil.log('[electron-builder]','clean cmd',log);
    const fs = require('fs');
    if (!fs.existsSync('buildcmd/moogo'+ext)) {
        gutil.log('[electron-builder]','cmd file not exist',gutil.colors.red('buildcmd/moogo'+ext));
        process.exit(1);
    }
    return gulp.src('buildcmd/moogo'+ext).pipe(gulp.dest('app/cmd/'));
});

gulp.task('build-electron',['clean:electron-cmd'],(cb)=>{
    const spawn = require('child_process').spawn;
    let builder = spawn(__dirname+"/node_modules/.bin/electron-builder",['--'+platform,'--x64'],{
        cwd: __dirname
    });
    builder.stdout.on('data', (data) => {
        gutil.log('[electron-builder]',gutil.colors.white(data.toString()));
    });

    builder.stderr.on('data', (data) => {
        gutil.log('[electron-builder]',gutil.colors.white(data.toString()));
    });

    builder.on("error",(err)=>{
        gutil.log('[electron-builder]',gutil.colors.red(err));
    });
    builder.on('close', (code) => {
        gutil.log('[electron-builder]',gutil.colors.white(`child process complete exit code: ${code}`));
        cb();
    });
});

gulp.task('default', ['server']);

gulp.task('build',['clean','build:pack']);