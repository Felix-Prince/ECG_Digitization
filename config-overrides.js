const { overrideDevServer } = require("customize-cra");

const devServerConfig = () => (config) => {
    return {
        ...config,
        proxy: {
            // 这里表明你的 web 端请求需要时 /api 开头的，后端需要和这里一致，当然也可以在 rewrite 那块修改相应配置
            "/api": {
                changeOrigin: true,
                secure: false,
                // rewrite
            },
        },
    };
};

module.exports = {
    devServer: overrideDevServer(devServerConfig),
};
