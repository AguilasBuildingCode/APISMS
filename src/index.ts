import Config, { EnvTypes } from "./config/config";
import morgan from "morgan";
import helmet from "helmet";
import https from "https";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { apis, apisPath } from "./routes/apis/apis";
import { auth, authMiddleware, authPath } from "./routes/auth/auth";
import authValidateMiddleware from "./middlewares/auth_validate_middleware";
import authValidateSocketMiddleware from "./middlewares/auth_validate_socket_middleware";

const config = Config.getInstance();
config
  .getEnvStatus()
  .then((status) => console.log(status))
  .catch((error) => console.error(error));

const app = Config.getApp();
const portAPIHTTP = config.getPortAPIHTTP();
const portAPIHTTPS = config.getPortAPIHTTPS();
const io = new Server();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  morgan("combined", {
    stream: Config.getStreamLog(),
  })
);
app.use(helmet());

app.use(authPath, authMiddleware, auth);
app.use(apisPath, authValidateMiddleware, apis);

if (config.getEnv() === EnvTypes.PROD) {
  io.attach(
    https
      .createServer(
        {
          key: config.getKey(),
          cert: config.getCert(),
          ca: config.getCA(),
        },
        app
      )
      .listen(portAPIHTTPS, () => {
        console.log(`Server run on port: ${portAPIHTTPS}`);
      })
  ).use(authValidateSocketMiddleware);
} else {
  io.attach(
    http.createServer(app).listen(portAPIHTTP, () => {
      console.log(`Server run on port: ${portAPIHTTP}`);
    })
  ).use(authValidateSocketMiddleware);
}

export default io;
