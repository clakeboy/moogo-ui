import webpack from 'webpack';
import merge from 'webpack-merge';
let cfg = require('./webpack.common').default;

export default merge(cfg,{
    entry: {
        //主文件
        index : [
            'webpack/hot/dev-server',
            'webpack-hot-middleware/client?reload=true',
            './src/index.jsx'
        ]
    },
    //插件项
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
    ],
    mode: 'development',
    devtool: 'eval-source-map',
});