import Config, { EnvTypes } from "./config";
import morgan from "morgan";
import helmet from "helmet";
import https from "https";
import express from "express";
import home from "./routes/home";

const config = Config.getInstance();
config
  .getEnvStatus()
  .then((status) => console.log(status))
  .catch((error) => console.error(error));

const app = Config.getApp();
const portAPIHTTP = config.getPortAPIHTTP();
const portAPIHTTPS = config.getPortAPIHTTPS();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  morgan("common", {
    stream: Config.getStreamLog(),
  })
);
app.use(helmet());

app.use(home);

if (config.getEnv() === EnvTypes.PROD) {
  https
    .createServer(
      {
        key: config.getKey(),
        cert: config.getCert(),
      },
      app
    )
    .listen(portAPIHTTPS, () => {
      console.log(`Server run on port: ${portAPIHTTPS}`);
    });
} else {
  app.listen(portAPIHTTP, () => {
    console.log(`Server run on port: ${portAPIHTTP}`);
  });
}
