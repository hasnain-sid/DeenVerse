const path = require("path");

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!@deenverse)"],
  moduleNameMapper: {
    "^@deenverse/shared$": path.resolve(__dirname, "../packages/shared/dist/index.js"),
    "^@deenverse/shared/(.*)$": path.resolve(__dirname, "../packages/shared/dist/$1/index.js"),
  },
};
