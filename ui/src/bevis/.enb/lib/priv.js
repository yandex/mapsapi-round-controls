function Blocks() {
    this._methods = {};

    /**
     * Basic i18n implementation. Returns key for each call.
     *
     * @public
     * @param {String} keyset
     * @param {String} key
     * @returns {String}
     */
    this.i18n = function (keyset, key) {
        return key;
    };
}

Blocks.prototype = {

    /**
     * Declares bemjson block builder.
     *
     * @param {String} name
     * @param {Function} method
     * @returns {Blocks}
     */
    declare: function (name, method) {
        this._methods[name] = method;
        return this;
    },

    exec: function (name, data) {
        var method = this._methods[name];
        if (method) {
            return this._methods[name](data);
        } else {
            throw new Error('Priv method ' + name + ' was not found');
        }
    },

    setI18n: function (i18n) {
        this.i18n = i18n;
    }

};

module.exports = Blocks;
