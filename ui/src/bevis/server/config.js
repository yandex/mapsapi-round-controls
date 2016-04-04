var extend = require('node.extend');

module.exports = {
    /**
     * Returns config by name.
     *
     * @param {String} name
     * @returns {Object}
     */
    get: function (name) {
        return require('../configs/current/' + name);
    },

    /**
     * Returns config for the client.
     *
     * @param {Object} [data] Additional data to be added to the client config.
     * @returns {Object}
     */
    getClientConfig: function (data) {
        return extend(true, data || {}, this.get('config'));
    }
};
