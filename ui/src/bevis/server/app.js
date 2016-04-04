var fs = require('fs');
var pingMiddleware = require('express-ping-middleware');
var logger = require('./logger');
var config = require('./config');
var buildPage = require('./build-page');

var app = require('express')();
var env = config.get('env');
var assets = config.get('assets');

app
    .disable('x-powered-by')
    .enable('trust proxy')
    .use(pingMiddleware)
    .use(assets.middleware())
    .get('/', function (req, res, next) {
        var data = {clientConfig: config.getClientConfig()};
        buildPage('build/index', req, res, next, data);
    })
    .use(function (req, res) {
        res.statusCode = 404;
        res.end('Not found');
    })
    .use(function (err, req, res, next) {
        /* jshint unused: vars */
        logger.error(err.stack);
        res.statusCode = 500;
        res.end('Internal error');
    });

exports.start = function () {
    var portOrSocket = env.port || env.socket;
    app
        .listen(portOrSocket, function () {
            logger.info('app started on %s', portOrSocket);
            if (env.socket && !env.port) {
                fs.chmod(env.socket, '0777');
            }
        })
        .once('error', function (err) {
            logger.error('worker %s has failed to start application', process.pid);
            if (err.code === 'EADDRINUSE') {
                logger.error('port (or socket) %s is taken', portOrSocket);
                process.kill();
            } else {
                console.log(err.stack);
            }
        });
};

if (!module.parent) {
    exports.start();
}
