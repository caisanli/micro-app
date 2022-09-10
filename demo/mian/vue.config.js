module.exports = {
    transpileDependencies: ['vue', 'vue-router'],
    configureWebpack: {
        resolve: {
            fallback: {
                'path': false,
                'fs': false
            },
        },
    },

    devServer: {
        port: 19090,
        // headers: {
        //     "Access-Control-Allow-Origin": "*"
        // },
        // disableHostCheck: true,
        // allowedHosts: [
        //     'http://192.168.1.18:8080',
        //     'http://192.168.1.18:8081'
        // ]
    },
    lintOnSave: false
}
