const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.join(__dirname,"dist"),
		filename: 'paella-player.js',
		sourceMapFilename: 'paella-player.js.map'
	},
	devtool: 'source-map',
	devServer: {
		port: 8080,
		disableHostCheck: true,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
		}
	},
	
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},

			{
				test: /\.css$/,
				use:  [
					'style-loader',
					'css-loader'
				]
			},

			{
				test: /\.svg$/i,
				use: {
					loader: 'svg-inline-loader'
				}
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			inject: true
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: './config', to: 'config' },
				{ from: './src/style.css', to: '' }
			]
		})
	]
}