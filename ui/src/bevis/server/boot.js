var cluster = require('cluster');
var fs = require('fs');
var env = require('./config').get('env');
var logger = require('./logger');
var app = require('./app');

if (cluster.isMaster) {
    if (env.socket) {
        try {
            fs.unlinkSync(env.socket);
        } catch (e) {}
    }

    var workersCount = env.workersCount;

    while (workersCount--) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        if (!worker.suicide) {
            cluster.fork();
        }
    });

    if (env.hotReload) {
        ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(function (signal) {
            process.on(signal, function () {
                Object.keys(cluster.workers).forEach(function (id) {
                    cluster.workers[id].destroy();
                });
                process.exit();
            });
        });
    }
} else {
    logger.info('worker %s started', process.pid);
    app.start();
}
