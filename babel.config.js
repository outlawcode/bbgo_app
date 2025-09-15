module.exports = {
  presets: [
    [
      '@react-native/babel-preset',
      {
        enableBabelRuntime: false,
        unstable_transformProfile: 'hermes-stable',
        flow: 'strip',
      },
    ],
    '@babel/preset-typescript',
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: ['.ts', '.tsx', '.js', '.ios.js', '.android.js'],
        alias: {
          app: './app'
        },
      },
    ],
    'jest-hoist',
    'react-native-reanimated/plugin'
  ]
};
