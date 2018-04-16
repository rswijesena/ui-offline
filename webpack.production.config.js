const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const pathsToClean = [
    'dist'
];

const config = {
    entry: './js/index.js',
    devtool: 'inline-source-map',
    module: {
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true
                },
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'}, 
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new CleanWebpackPlugin(pathsToClean),
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'ui-offline-[chunkhash].js',
    }
};

module.exports = (env) => {
    var defaultDirectory = 'dist';

    if (env && env.build)
        defaultDirectory = env.build;

    config.output.path = path.resolve(__dirname, defaultDirectory, 'js');
    return config;
};