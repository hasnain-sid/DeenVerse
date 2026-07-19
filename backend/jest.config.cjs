const path = require("path");

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!@deenverse|quran-meta)"],
  moduleNameMapper: {
    "^@deenverse/shared$": path.resolve(__dirname, "../packages/shared/dist/index.js"),
    "^@deenverse/shared/(.*)$": path.resolve(__dirname, "../packages/shared/dist/$1/index.js"),
    // quran-meta only ships ESM "import" conditions; point Jest's CJS resolver at the files
    "^quran-meta/hafs$": path.resolve(__dirname, "../node_modules/quran-meta/dist/hafs.js"),
  },
};
