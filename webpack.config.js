const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        index: "./src/index.ts"
    },
    mode: "development",
    devtool: 'inline-source-map',
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
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
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
            },
            {
                test: /\.svg$/i,
                use: [ 'url-loader' ]
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
            minify: { minifyCSS: true, minifyJS: true, removeComments: true }
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [ new CssMinimizerPlugin() ]
    }
};