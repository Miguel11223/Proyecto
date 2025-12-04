module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testMatch: ['**/tests/**/*.test.js'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/src/config/',
      '/src/docs/'
    ],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
  };