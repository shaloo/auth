const path = require('path');

const serverConfig = () => {
  return {
    entry: {
      arcana_login: path.resolve(__dirname, 'src', 'index.ts'),
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(ts|js)?$/,
          use: {
            loader: 'ts-loader',
            options: {
              // configFile: 'tsconfig.json',
              // onlyCompileBundledFiles: true,
            },
          },
          exclude: [/node_modules/],
        },
      ],
    },
    plugins: [],
    resolve: {
      extensions: ['.ts', '.js'],
      // fallback: {
      //     "crypto": require.resolve("crypto-browserify"),
      // },
    },
    output: {
      filename: 'arcana_login.js',
      library: '[name]',
      path: path.resolve(__dirname, 'dist_bundle'),
    },
  };
};

module.exports = serverConfig;
