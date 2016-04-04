var path = require('path');

module.exports = {
    socket: '/tmp/' + path.basename(process.cwd()) + '-' + process.argv[2] + '.socket',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    workersCount: 2,
    debug: true,
    hotReload: true
};
