module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": [1, 170, 2, {
      "ignorePattern": "^import\\s.+\\sfrom\\s.+;$",
      "ignoreUrls": true,
    }],
  },
};
