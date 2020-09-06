const path = require('path');
const nodeExternals = require('webpack-node-externals');

const library = "yuyo";

const nodeConfig = {
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: library + '.node.js',
    library,
    libraryTarget: 'umd'
  }
};

const nodeDevConfig = {
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: library + '.node.dev.js',
    library,
    libraryTarget: 'umd'
  }
};

const webConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: library + '.js',
    library
  }
};

const devConfig = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: library + '.dev.js',
    library
  },
  devtool: 'source-map',
  optimization: {
    runtimeChunk: true
  }
};

module.exports = [nodeConfig, nodeDevConfig, webConfig, devConfig];
