const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')

const html = new HtmlWebpackPlugin({
    title: "Shades",
    meta: {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no'
    }
});
const offline = new OfflinePlugin;
const manifest = new WebpackPwaManifest({
    name: 'Shades',
    short_name: 'Shades',
    description: 'If you are color blind, this is not the game for you.',
    background_color: '#ffffff',
    theme_color: "#ffffff",
    display: "fullscreen",
    orientation: "portrait",
    ios: true,
    icons: [{
            src: path.resolve('./src/icons/192.png'),
            sizes: [192],
            ios: true
        },
        {
            src: path.resolve('./src/icons/512.png'),
            sizes: [512],
            ios: true
        }
    ]
})

module.exports = {
    mode: "development",
    entry: './src/game.js',
    output: {
        path: path.resolve('./build'),
        filename: '[name].[hash].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }]
    },
    plugins: [html, manifest, offline]
};