module.exports = {
    publicPath: '/vue2',
    configureWebpack: {
        output: {
            jsonpFunction: 'vue2JsonpFunction'
        },
    },
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        contentBasePublicPath: 'http://192.168.1.18:8081/',
        disableHostCheck: true,
        allowedHosts: [
            'http://192.168.1.18:8080',
            'http://192.168.1.18:8081'
        ]
    }
}