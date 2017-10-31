const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')

const html = new HtmlWebpackPlugin({ template: './src/index.html' });
const ugly = new UglifyJSPlugin;
const offline = new OfflinePlugin;
const manifest = new WebpackPwaManifest({
    name: 'Shades',
    short_name: 'Shades',
    description: 'If you are color blind, this is not the game for you.',
    background_color: '#ffffff',
    display: "fullscreen",
    orientation: "portrait",
    ios: true,
    icons: [
      {
        src: path.resolve('./src/icon.png'),
        sizes: [192],
        ios: true     
      }
    ]
  })

module.exports = {
    entry: './src/game.js',
    output: {
        path: path.resolve('./build'),
        filename: '[name].[hash].js'
    },
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
    plugins: [html, manifest, ugly, offline],
    resolve: {
        alias: {
            'eve': 'eve-raphael/eve'
        }
    }
};
