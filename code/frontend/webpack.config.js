const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './src/scripts/index.ts',
  output: {
    library: 'tvTools',
    filename: 'tv-app-tools-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: '**/*.html', context: 'src/html'},
        {from: '**/*.(css|png)', context: 'src/assets'}

      ],
    }),
  ]
};
