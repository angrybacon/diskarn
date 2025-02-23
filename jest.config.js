/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  resetMocks: true,
  testEnvironment: 'node',
  transform: { '^.+.ts$': ['ts-jest', {}] },
};
