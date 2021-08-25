const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const minicss = new MiniCssExtractPlugin({
  filename: '[name].[contenthash].css',
  chunkFilename: '[id].[contenthash].css',
});
const clean = new CleanWebpackPlugin();
const html = new HtmlWebpackPlugin({
  favicon: './src/icons/icon.png',
  meta: {
    viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no',
  },
  template: './src/index.html',
});
const workbox = new WorkboxPlugin.GenerateSW({
  clientsClaim: true,
  skipWaiting: true,
});
const manifest = new WebpackPwaManifest({
  publicPath: '.',
  name: 'Shades',
  short_name: 'Shades',
  description: 'If you are color blind, this is not the game for you.',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  ios: true,
  icons: [
    {
      src: path.resolve('./src/icons/icon.png'),
      sizes: [120, 152, 167, 180, 1024],
      destination: path.join('icons', 'ios'),
      ios: true,
    },
    {
      src: path.resolve('./src/icons/icon.png'),
      sizes: [36, 48, 72, 96, 144, 192, 512],
      destination: path.join('icons', 'android'),
    },
    {
      src: path.resolve('./src/icons/maskable_icon.png'),
      sizes: [36, 48, 72, 96, 144, 192, 512],
      destination: path.join('icons', 'maskable'),
      purpose: 'maskable',
    },
  ],
});

module.exports = {
  target: 'browserslist:last 2 Chrome versions, iOS 14',
  mode: 'development',
  entry: './src/game.ts',
  output: {
    path: path.resolve('./dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [clean, html, minicss, workbox, manifest],
};
