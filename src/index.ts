/* eslint-disable @typescript-eslint/no-var-requires */
import consola from "consola";
import Server from "yet-another-http/dist";
import config from "./config";
import {makeDb} from "./helpers/makeDb";
import io from "./helpers/makeSocketIo";

const server = new Server(config.HTTP.PORT, config.HTTP.HOST);

// Prepare consola
consola.wrapAll();

// Main handler
server.on("GET", "/getUserInfo", require("./handlers/onGetUserInfo").default);
server.on("POST", "/provideAuth", require("./handlers/onProvideAuth").default, {});

// Handle sockets
// eslint-disable-next-line @typescript-eslint/no-empty-function
io.on("connection", () => {});

// Run HTTP Server
Promise.resolve()
  .then(() => server.run())
  .then(() => makeDb())
  .then(() => {
    consola.ready(`Connected to DB "${config.DB.NAME}" at ${config.DB.URL}`);
  })
  .then(() => {
    consola.ready(`HTTP server started at http://${server.host}:${server.port}`);
  });
