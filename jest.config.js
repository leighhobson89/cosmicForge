export default {
  preset: null,
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './html-report',
      filename: 'report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'CosmicForge Test Report',
      logoImgPath: undefined,
      inlineSource: false
    }]
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  testTimeout: 180000
};
