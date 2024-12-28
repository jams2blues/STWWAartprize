// craco.config.js

const webpack = require('webpack');

module.exports = {
  /**
   * 1) Add a babel section to inject Babel plugins with matching "loose" mode
   *    This ensures all class-related proposals are consistently configured,
   *    preventing mismatch errors, and addresses the "private-property-in-object" usage.
   */
  babel: {
    plugins: [
      // Keep "loose" the same for all class-related proposals
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ],
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // 2) Replace Deprecated Webpack Dev Server Options
      if (webpackConfig.devServer) {
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          // Add custom middlewares here if needed
          return middlewares;
        };
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;
      }

      // 3) Polyfills for Node.js Core Modules
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
        process: require.resolve('process/browser.js'),
        fs: false, // Mock 'fs' as it's not available in the browser
      };

      // Alias 'stream' to 'stream-browserify'
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        stream: 'stream-browserify',
      };

      // Provide global variables for Node.js shims
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // 4) Suppress Source Map Warnings for @airgap Packages
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (
          rule.use &&
          Array.isArray(rule.use) &&
          rule.use.find((u) => u.loader === 'source-map-loader')
        ) {
          return {
            ...rule,
            exclude: [
              ...(rule.exclude || []),
              /@airgap\//, // Exclude all @airgap packages
              /@airgap\/beacon-core/,
              /@airgap\/beacon-dapp/,
              /@airgap\/beacon-transport-matrix/,
              /@airgap\/beacon-transport-postmessage/,
              /@airgap\/beacon-transport-walletconnect/,
            ],
          };
        }
        return rule;
      });

      // 5) Ignore Remaining Source Map Loader Warnings
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        // Silence warnings from source-map-loader about failed source map parsing
        {
          module: /source-map-loader/,
          message: /Failed to parse source map/,
        },
      ];

      // 6) Exclude Additional Problematic Modules from source-map-loader
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/cipher-base/,
          /node_modules\/hash-base/,
          /node_modules\/@walletconnect\//,
          /node_modules\/qrcode-svg/,
        ],
      });

      return webpackConfig;
    },
  },
};
