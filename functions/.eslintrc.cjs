module.exports = {
  "root": true,
  "env": {
    es6: true,
    node: true,
  },
  "parserOptions": {
    "ecmaVersion": 2019,
    "sourceType": "module",
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "parser": "babel-eslint",
  "rules": {
    "quotes": ["error", "double"],
    "max-len": [1, 170, 2, {
      "ignorePattern": "^import\\s.+\\sfrom\\s.+;$",
      "ignoreUrls": true,
    }],
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@material-ui/*/*/*", "!@material-ui/core/test-utils-BETA/*"],
      },
    ],
  },
};
