const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module: {
	  rules: [
	    {
	      test: /\.js$/,
	      exclude: [/node_modules/],
	      use: [{
	        loader: 'babel-loader',
	        options: { presets: ['es2015'] }
	      }]
	    },
	    {
			  test: /\.css$/,
			  use: ExtractTextPlugin.extract({
			    fallback: 'style-loader',
			    use: 'css-loader'
			  })
			}
	  ]
	},
	plugins: [
	  new ExtractTextPlugin('styles.css'),
	  new HtmlWebpackPlugin()
	]
}