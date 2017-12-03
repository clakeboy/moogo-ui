import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
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
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.CommonsChunkPlugin('common'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
    ],
    devtool: 'eval-source-map',
});