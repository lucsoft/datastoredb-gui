const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');
const package = require('./package.json');
const { execSync } = require('child_process')
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (_, mode) => {
    const isProduction = (typeof mode.env.production === "boolean" && mode.env.production);
    return {
        entry: {
            index: "./src/index.ts"
        },
        mode: isProduction ? "production" : "development",
        devtool: isProduction ? undefined : 'inline-source-map',
        output: {
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: [ ".js", ".ts" ]
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: 'file-loader'
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        'css-loader'
                    ]
                }
            ]
        },
        devServer: {
            contentBase: "./dist",
            port: 80,
            host: '0.0.0.0'
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                inject: 'body',
                chunks: [ 'index' ],
                template: './src/index.html',
                filename: 'index.html',
                favicon: './res/favicon.ico',
                minify: isProduction ? { minifyCSS: true, minifyJS: true, removeComments: true } : undefined
            }),
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(package.version.toString()),
                COMPILED_AD: JSON.stringify(new Date()),
                LAST_COMMIT: JSON.stringify(execSync("git rev-parse HEAD").toString().trim())
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'static/images', to: 'images' },
                    { from: 'static/manifest', to: 'manifest' }
                ]
            }),
            new WorkboxPlugin.GenerateSW({
                // these options encourage the ServiceWorkers to get in there fast
                // and not allow any straggling "old" SWs to hang around
                clientsClaim: true,
                skipWaiting: true
            }),
            // new WebpackPwaManifest({
            //     name: 'Panda 2.0',
            //     short_name: 'Panda',
            //     description: 'Manage and track Icons, Images and more',
            //     background_color: '#ffffff',
            //     crossorigin: 'use-credentials',
            //     icons: [
            //         {
            //             src: path.resolve('res/pandaDesktopIcon.png'),
            //             size: [ 96, 128, 192, 256, 384, 512 ],
            //             purpose: 'maskable'
            //         }
            //     ]
            // })

        ],
        optimization: isProduction ? {
            minimize: true,
            minimizer: [ new TerserPlugin(), new CssMinimizerPlugin() ],
            splitChunks: {
                chunks: 'async',
                maxAsyncRequests: 30,
                maxInitialRequests: 30
            }
        } : undefined
    }
}