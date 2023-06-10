module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ["solid"],
  extends: ["eslint:recommended", "plugin:solid/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  rules: {},
};
