const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const clean = new CleanWebpackPlugin();
const html = new HtmlWebpackPlugin({
    title: "Shades",
    meta: {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no'
    },
    minify: true
});
const offline = new OfflinePlugin({minify: true});
const manifest = new WebpackPwaManifest({
    name: 'Shades',
    short_name: 'Shades',
    description: 'If you are color blind, this is not the game for you.',
    background_color: '#ffffff',
    theme_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    ios: true,
    icons: [{
            src: path.resolve('./src/icons/icon.png'),
            sizes: [120, 152, 167, 180, 1024],
            destination: path.join('icons', 'ios'),
            ios: true
          },
          {
            src: path.resolve('./src/icons/icon.png'),
            sizes: [36, 48, 72, 96, 144, 192, 512],
            destination: path.join('icons', 'android')
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
    plugins: [clean, html, offline, manifest]
};