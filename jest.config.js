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
  reporters: ['default'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  testTimeout: 180000
};
