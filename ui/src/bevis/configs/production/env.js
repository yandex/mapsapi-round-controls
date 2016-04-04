var path = require('path');

module.exports = {
    socket: '/tmp/' + path.basename(process.cwd()) + '-' + process.argv[2] + '.socket',
    workersCount: 2,
    debug: false,
    hotReload: false
};
