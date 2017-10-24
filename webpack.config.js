var path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const html = new HtmlWebpackPlugin({ template: './index.html' });
const ugly = new UglifyJSPlugin;
const offline = new OfflinePlugin;

module.exports = {
    entry: './js/game.js',
    output: {
        path: path.resolve('./build'),
        filename: '[name].[hash].js'
    },
    module: {
        loaders: [
            {   test: /\.json$/,
                loader: 'file-loader'
            },
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
    plugins: [html, ugly, offline],
    resolve: {
        alias: {
            'eve': 'eve-raphael/eve'
        }
    }
};
