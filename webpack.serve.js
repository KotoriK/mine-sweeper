
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin');
const dev = require('./webpack.dev.js')
module.exports = merge(dev, {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    sourceMap: true,
                    ecma: 2019,
                    keep_classnames:/ /,
                    module:true
                },
            })
        ]
    },
    devServer: undefined
})