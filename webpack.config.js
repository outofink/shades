var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './js/game.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'game.bundle.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            }
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['babel-preset-env']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
    resolve: {
        alias: {
            'eve': 'eve-raphael/eve'
        }
    }
};
