import Config, { EnvTypes } from "./config/config";
import morgan from "morgan";
import helmet from "helmet";
import https from "https";
import http from "http";
import express from "express";
import { Server } from "socket.io"
import { apis, apisPath } from "./routes/apis/apis";
import { auth, authPath, loginMiddleware } from "./routes/auth/auth";
import authMiddleware from "./routes/middlewares/auth_middleware";
import assignmentSMSPendingCron from "./cron/devices_works";

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

app.use(authPath, loginMiddleware, auth);
app.use(apisPath, authMiddleware, apis);

if (config.getEnv() === EnvTypes.PROD) {
  io.attach(https
    .createServer(
      {
        key: config.getKey(),
        cert: config.getCert(),
      },
      app
    )
    .listen(portAPIHTTPS, () => {
      console.log(`Server run on port: ${portAPIHTTPS}`);
      assignmentSMSPendingCron.start()
    }));
} else {
  io.attach(http.createServer(app).listen(portAPIHTTP, () => {
    console.log(`Server run on port: ${portAPIHTTP}`);
    assignmentSMSPendingCron.start()
  }));
}

export default io
