module.exports = {
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        disableHostCheck: true,
        allowedHosts: [
            'http://192.168.1.18:8080',
            'http://192.168.1.18:8081'
        ]
    }
}