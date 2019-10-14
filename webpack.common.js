/**
 * Created by CLAKE on 2016/8/9.
 */

export default {
    //页面入口文件配置
    mode: 'production',
    output: {
        path: `${__dirname}/app/ui`,
        filename: '[name].js',
        chunkFilename:`./manage/chunk/[name].[chunkhash:8].js`
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            { test: /\.woff[2]?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
            { test: /\.ttf$/,  use: "url-loader?limit=10000&mimetype=application/octet-stream" },
            { test: /\.eot$/,  use: "file-loader" },
            { test: /\.svg$/,  use: "url-loader?limit=10000&mimetype=image/svg+xml" },
            {
                test: /\.jsx$/,
                use: {loader:'babel-loader',query:{presets:["@babel/preset-env", "@babel/preset-react"]}},
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: {loader:'babel-loader',query:{presets:["@babel/preset-env", "@babel/preset-react"]}},
                exclude: /node_modules/
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                use: 'url-loader?limit=10000&name=img/[hash:8].[name].[ext]'
            }
        ]
    },
    //其它解决方案配置
    resolve: {
        extensions: [ '.js', '.json', '.less', '.jsx']
    },
    node: {
        fs: 'empty'
    },
    externals: {
        "jquery": "jQuery",
        "react": "React",
        "react-dom": "ReactDOM",
        "zepto": "Zepto",
        "marked":"Marked",
        "moment":"moment"
    }
};