
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
module.exports = merge(common, {
    mode: 'development',
    entry: {
        test: './index.html',
        testjs:'./test_index.tsx'
    },
    module:{
        rules:[{
            test: /\.html$/,
            type: 'asset/resource',
            generator: {
              filename: '[name][ext]',
            },
          },
          {
            test: /\.html$/i,
            use: ['extract-loader', {
                loader:'html-loader',options: {
                    sources:false,
                esModule: false,
            }}],
          },{ test: /\.tsx?$/,exclude:/\.test\.tsx?$/, use: 'ts-loader' },
          {
              test: /\.m?js$/,
              exclude: /(node_modules)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
        ]
    },
    output: {
        path: path.join(__dirname, 'dev'),
    },
    devServer: {
        http2: true,
        hot: true,
        contentBase: path.join(__dirname, 'dev'),
        compress: true,
        port: 9000,
    },
})