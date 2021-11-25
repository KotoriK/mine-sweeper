
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path')
module.exports = merge(common, {
    mode: 'production',
    entry: {
        minesweeper: './src/index.ts'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    sourceMap: true,
                    ecma: 2016
                },
            })
        ]
    }, module: {
        rules: [{ test: /\.tsx?$/, exclude: /\.test\.tsx?$/, use: 'ts-loader' },
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
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "module"
    }, experiments: {
        outputModule: true,
    }
})