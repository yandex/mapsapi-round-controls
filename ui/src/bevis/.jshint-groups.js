module.exports = {
    options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        undef: true,
        unused: true,
        trailing: true,
        maxlen: 120,
        quotmark: 'single'
    },
    groups: {
        'bt templates': {
            options: {
                predef: ['module']
            },
            includes: [
                'client/**/*.bt.js'
            ]
        },

        server: {
            options: {
                node: true
            },
            includes: [
                'server/**'
            ]
        }
    }
};
