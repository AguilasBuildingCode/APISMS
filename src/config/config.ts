import { config, DotenvConfigOutput } from "dotenv";
import express from "express";
import path from "path";
import fs from "fs";

export enum EnvTypes {
  LOCAL = "local",
  BETA = "beta",
  PROD = "prod",
}

const LOCAL_DIR = path.join(__dirname, `../.${EnvTypes.LOCAL}.env`);
const BETA_DIR = path.join(__dirname, `../.${EnvTypes.BETA}.env`);
const PROD_DIR = path.join(__dirname, `../.${EnvTypes.PROD}.env`);

export default class Config {
  private static config: Config = new Config().initConfig();
  private static app: express.Express = express();

  private portAPIHTTP?: number;
  private portAPIHTTPS?: number;

  private dotenvConfigOutput?: DotenvConfigOutput;
  private envType?: EnvTypes;
  private jwtSecret?: string;

  private key?: string;
  private cert?: string;
  private ca?: string;

  static getInstance(): Config {
    return this.config;
  }

  protected initConfig(): Config {
    switch (process.env.NODE_ENV) {
      case EnvTypes.LOCAL:
        if (fs.existsSync(LOCAL_DIR)) {
          this.dotenvConfigOutput = config({
            path: LOCAL_DIR,
            debug: true,
          });
          this.envType = EnvTypes.LOCAL;
        } else {
          throw new Error(`Enviroment file ${LOCAL_DIR} not found`);
        }
        break;
      case EnvTypes.BETA:
        if (fs.existsSync(BETA_DIR)) {
          this.dotenvConfigOutput = config({
            path: BETA_DIR,
            debug: true,
          });
          this.envType = EnvTypes.BETA;
        } else {
          throw new Error(`Enviroment file ${BETA_DIR} not found`);
        }
        break;
      case EnvTypes.PROD:
        if (fs.existsSync(PROD_DIR)) {
          this.dotenvConfigOutput = config({
            path: PROD_DIR,
          });
          this.envType = EnvTypes.PROD;
        } else {
          throw new Error(`Enviroment file ${PROD_DIR} not found`);
        }
        break;
      default:
        throw new Error("No NODE_ENV found");
    }

    this.key = path.join(__dirname, `../cert/${this.envType}_key.pem`);
    this.cert = path.join(__dirname, `../cert/${this.envType}_cert.pem`);
    this.ca = path.join(__dirname, `../cert/${this.envType}_ca.pem`);

    this.portAPIHTTP = Number(process.env.PORT_API_HTTP);
    this.portAPIHTTPS = Number(process.env.PORT_API_HTTPS);
    this.jwtSecret = process.env.JWT_SECRET
    return this;
  }

  static getApp(): express.Express {
    return this.app;
  }

  getPortAPIHTTP(): number {
    if (this.portAPIHTTP) {
      return this.portAPIHTTP;
    }
    throw new Error("Env not initilizated, portAPI not found");
  }

  getPortAPIHTTPS(): number {
    if (this.portAPIHTTPS) {
      return this.portAPIHTTPS;
    }
    throw new Error("Env not initilizated, portAPI not found");
  }

  static getStreamLog() {
    return fs.createWriteStream(path.join(__dirname, "../logs/access.log"), {
      flags: "a",
    });
  }

  getEnv(): EnvTypes {
    if (this.envType) {
      return this.envType;
    }
    throw new Error("Env type no found");
  }

  getJWTSecret(): string {
    if (this.jwtSecret) {
      return this.jwtSecret
    }
    throw new Error("JWT_SECRET not found in env file")
  }

  getKey(): string {
    if (this.key) {
      if (fs.existsSync(this.key)) {
        return fs.readFileSync(this.key, "utf8");
      }
      throw new Error(`File ${this.key} not found`);
    }
    throw new Error("Env key not found");
  }

  getCert(): string {
    if (this.cert) {
      if (fs.existsSync(this.cert)) {
        return fs.readFileSync(this.cert, "utf8");
      }
      throw new Error(`File ${this.cert} not found`);
    }
    throw new Error("Env cert not found");
  }

  getCA(): string {
    if (this.ca) {
      if (fs.existsSync(this.ca)) {
        return fs.readFileSync(this.ca, "utf8");
      }
      throw new Error(`File ${this.ca} not found`);
    }
    throw new Error("Env ca not found");
  }

  getEnvStatus(): Promise<any> {
    return new Promise((res, rej) => {
      if (this.dotenvConfigOutput) {
        if (this.dotenvConfigOutput.error) {
          rej(this.dotenvConfigOutput.error);
        } else {
          res({ msg: "Enviroment conigurate sucessfull", env: this.envType });
        }
      } else {
        rej({
          name: "unknow",
          message: "Enviroment not configurate, unknow error",
        });
      }
    });
  }
}
