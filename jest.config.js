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
      publicPath: process.env.JEST_HTML_REPORT_PATH ?? './html-report',
      filename: process.env.JEST_HTML_REPORT_FILENAME ?? 'report.html',
      expand: true,
      hideIcon: false,
      pageTitle: process.env.JEST_HTML_REPORT_TITLE ?? 'CosmicForge Test Report',
      includeConsoleLog: true,
      logoImgPath: undefined,
      inlineSource: false
    }]
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  testTimeout: 180000
};
