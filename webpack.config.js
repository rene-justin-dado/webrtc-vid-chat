const path = require('path')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'src', 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {loader: 'babel-loader', test: /\.jsx?$/, exclude: /node_modules/}
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devtool: 'source-map'
}
