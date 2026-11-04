const path = require("path");

process.env.NODE_ENV = "production";

const standaloneServer = path.join(
  __dirname,
  "ipdav_cms",
  ".next",
  "standalone",
  "ipdav_cms_git",
  "ipdav_cms",
  "server.js"
);

require(standaloneServer);