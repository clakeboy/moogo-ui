import webpack from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
let cfg = require('./webpack.common').default;

export default merge(cfg,{
    entry: {
        //主文件
        index : './src/index.jsx'
    },
    //插件项
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ],
    module: {
        // rules: [
        //     {
        //         test: /\.css$/,
        //         use: [MiniCssExtractPlugin.loader,'css-loader'],
        //         exclude: /node_modules/
        //     },
        //     {
        //         test: /\.less$/,
        //         use: [MiniCssExtractPlugin.loader,'css-loader','less-loader'],
        //         // exclude: /node_modules/
        //     }
        // ]
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader','css-loader','less-loader']
            }
        ]
    },
    // optimization: {
    //     // splitChunks: {
    //     //     minSize: 50000,
    //     //     minChunks: 2,
    //     //     cacheGroups: {
    //     //         commonFunc: {
    //     //             filename:'common.js',
    //     //             test:/\.js(x?)$/,
    //     //             chunks: "initial"
    //     //         },
    //     //         styles: {
    //     //             name: 'main',
    //     //             test: /\.(le|c)ss$/,
    //     //             chunks: 'all',
    //     //             enforce: true
    //     //         }
    //     //     }
    //     // },
    //     minimize:true,
    // },
    mode: 'production',
    // mode: 'development',
    devtool: 'eval-source-map',
});