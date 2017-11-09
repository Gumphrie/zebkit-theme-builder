'use strict';

module.exports = function() {

    const compressor = require('node-minify'),
          fs = require('fs-extra'),
          clone = require('git-clone-repo').default,
          replace = require('replace-in-file'),
          GulpRunner = require('gulp-runner'),
          config = require('../config.js');


    console.log('getting zebkit library - please wait...');

    clone('https://github.com/barmalei/zebkit');

    console.log('zebkit library retrieved - applying patches...');

    replace({
        files: 'zebkit/gulpfile.js',
        from: '"src/js/draw/draw.common.js",',
        to: '"src/js/draw/draw.common.js","../setup/draw-additions.js",',
    }, (error, changes) => {
        if (error) {
            return console.error('Error occurred:', error);
        }

        replace({
            files: 'zebkit/gulpfile.js',
            from: '"src/js/ui/spin/ui.spin.js"',
            to: '"src/js/ui/spin/ui.spin.js","../setup/ui-additions.js"',
        }, (error, changes) => {
            if (error) {
                return console.error('Error occurred:', error);
            }

            fs.copySync(__dirname + '/../public/js/lib/rs/themes/' + config.theme, __dirname + '/../zebkit/src/js/rs/themes/' + config.theme);

            let gulp = new GulpRunner('zebkit/gulpfile.js');

            gulp.run('runtime', (err) => {
                if (err) {
                    console.log('failed to build zebkit runtime with error:' + err);
                    return;
                }

                fs.copySync(__dirname + '/../zebkit/build/zebkit.js', __dirname + '/../public/js/lib/zebkit.js');
                fs.removeSync(__dirname + '/../zebkit/build');

                gulp.run('zebkit', {
                    bundle: config.theme
                }, (err) => {
                    if (err) {
                        console.log('failed to build embedded theme zebkit runtime with error:' + err);
                        return;
                    }

                    fs.copySync(__dirname + '/../zebkit/build/zebkit.min.js', __dirname + '/../public/js/lib/zebkit.min.js');
                    fs.removeSync(__dirname + '/../zebkit');
                    console.log("zebkit bundled with theme - patch complete");
                });
            });
        });
    });
};