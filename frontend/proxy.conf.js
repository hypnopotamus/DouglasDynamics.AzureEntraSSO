const PROXY_CONFIG = {
    "/api": {
        "target": process.env.services__api__https__0,
        "secure": false,
        "logLevel": "debug",
        "pathRewrite": { '/api': '/user' },
        configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
                console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
                const headers = proxyReq.getHeaders();
                console.log(
                    req.method,
                    req.url,
                    " -> ",
                    `${headers.host}${proxyReq.path}`,
                );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
                console.log(
                    req.method,
                    "Target Response",
                    proxyRes.statusCode,
                    ":",
                    req.url,
                );
            });
        }
    }
}

module.exports = PROXY_CONFIG