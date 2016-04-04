var path = require('path'),
    ymb = require('ymb'),
    plg = ymb.plugins,
    localPlg = require('./plugins/public'),
    gulp = ymb.gulp;

var cfg = ymb.resolveBuildConfig();

gulp.task('ym-clean', function (cb) {
    ymb.del(path.resolve(cfg.dest), { force: true }, cb);
});

gulp.task('ym-watch', ['ym-build'], function () {
    var watcher = gulp.watch(
            [cfg.src.js, cfg.src.css, cfg.src.htmlLayouts, cfg.src.cssLayouts, cfg.src.cssPackages],
            ['ym-rebuild']
        );

    watcher.on('change', function (e) {
        if (e.type == 'deleted') {
            plg.remember.forget('ymb#default', e.path);
        }
    });

    return watcher;
});

gulp.task('ym-rebuild', rebuild);

gulp.task('ym-build', ['ym-clean'], rebuild);

function rebuild () {
    var async = cfg.store == 'async',
        standalone = cfg.target == 'standalone',
        chain = [],
        js, htmlLayouts, cssLayouts, cssPackages, css, modules;

    js = gulp.src(cfg.src.js)
        .pipe(plg.cache('js'));

    htmlLayouts = gulp.src(cfg.src.htmlLayouts)
        .pipe(plg.cache('htmlLayouts'))
        .pipe(plg.templates.compile(cfg))
        .pipe(plg.templates.toModules(cfg));

    cssLayouts = gulp.src(cfg.src.cssLayouts)
        .pipe(plg.cache('cssLayouts'))
        .pipe(localPlg.packages.toModules(cfg));

    cssPackages = gulp.src(cfg.src.cssPackages)
        .pipe(plg.cache('cssPackages'))
        .pipe(localPlg.packages.toModules(cfg));

    css = gulp.src(cfg.src.css)
        .pipe(plg.cache('css'))
        .pipe(plg.css.optimize(cfg))
        .pipe(localPlg.css.images(cfg))
        .pipe(plg.css.toModules(cfg));

    modules = ymb.es.merge(js, htmlLayouts, cssLayouts, cssPackages, css);

    chain.push(plg.modules.setup(cfg));
    chain.push(plg.modules.ym(cfg));
    chain.push(plg.modules.init(cfg));

    if (cfg.minify) {
        chain.push(plg.modules.minify(cfg));
    }

    chain.push(plg.modules.store(cfg));

    return modules
        .pipe(plg.util.pipeChain(chain))
        .pipe(gulp.dest(path.resolve(cfg.dest)));
}
