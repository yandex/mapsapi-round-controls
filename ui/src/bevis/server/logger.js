var winston = require('winston');
var util = require('util');
var extend = require('node.extend');
var config = require('./config').get('logger');

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

var DEFAULT_CONFIG = {
    timestamp: function () {
        return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
    }
};

var logger = new winston.Logger({
    transports: Object.keys(config).map(function (key) {
        return new winston.transports[capitalize(key)](extend(true, {}, DEFAULT_CONFIG, config[key]));
    })
});

[
    'silly',
    'input',
    'verbose',
    'prompt',
    'info',
    'data',
    'help',
    'warn',
    'debug',
    'error'
].forEach(function (level) {
    exports[level] = function () {
        logger.log(level, util.format.apply(util, arguments));
    };
});
