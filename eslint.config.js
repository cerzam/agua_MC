const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['dist/', '.expo/', 'node_modules/'],
  },
  expoConfig,
]);
