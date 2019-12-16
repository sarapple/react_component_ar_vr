
const path = require('path');
var HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyPlugin = require('copy-webpack-plugin');

module.exports = 
[
	{
		mode: "development",
		devtool: "inline-source-map",
		entry: './src/main.tsx',

		output:
		{
			filename: 'index.js',
			path: path.resolve( __dirname, './dist' ),
		},

		plugins:
		[
			new HtmlWebpackPlugin(
				{
					hash: true,
					filename: "./index.html",
					template: "./src/index.html"
				}
			),
			new CopyPlugin(
				[
					{ from: './src/styles.css', to: 'styles.css' },
					{ from: './src/gadget_manifest.json', to: 'gadget_manifest.json' },
					{ from: './src/models', to: 'models' }
				]
				),
		],
		
		module: 
		{
			rules:
			[
				{ 
					test: /.tsx?$/,
					use: 'ts-loader',
					exclude: /node_modules/
				},
				{
					test: /.css$/,
					use: 
					[
						'style-loader',
						'css-loader'
					]
				},
				{
					test: /.(png|svg|jpg|gif)$/,
					use: 
					[
						'file-loader'
					]
				},
				{
					test: /.js$/,
					use: ['source-map-loader'],
					enforce: 'pre',
					exclude: [ /@tlaukkan/ ] // TSM has source maps but not source
				}
					
			]
		},

		resolve:
		{
			extensions: ['.ts', '.tsx', '.js']
		}
	}
];

