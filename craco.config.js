// craco.config.js

const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fallbacks for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        url: require.resolve('url'),
        util: require.resolve('util'),
        os: require.resolve('os-browserify/browser'),
        // Use 'process/browser.js' instead of 'process/browser'
        process: require.resolve('process/browser.js'),
      };

      // Plugins for providing globals
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // Ensure '.js' extension is resolved
      webpackConfig.resolve.extensions = [
        ...webpackConfig.resolve.extensions,
        '.js',
      ];

      return webpackConfig;
    },
  },
};
