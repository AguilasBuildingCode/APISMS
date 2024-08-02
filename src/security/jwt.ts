import jwt from "jsonwebtoken";
import Config, { EnvTypes } from "../config/config";
import Connection from "../db/models/connection_model";
import Users from "../db/models/users_model";
import Devices from "../db/models/devices_model";

export interface RefreshToken {
  parentToken: string;
}

export const JWTTokenLifeTimeMillis = 3600000;
export const JWTRefreshTokenExtraLifeTimeMillis = 300000;

export default class JWT {
  constructor(private config = Config.getInstance()) {}

  private getToken(
    who: Users | Devices | RefreshToken,
    expireAt: number
  ): string {
    if (this.config.getEnv() == EnvTypes.PROD) {
      return jwt.sign(
        { data: who, exp: Math.floor(expireAt / 1000) },
        this.config.getKey(),
        {
          algorithm: "ES256",
        }
      );
    }
    return jwt.sign(
      { data: who, exp: Math.floor(expireAt / 1000) },
      this.config.getJWTSecret(),
      {
        algorithm: "HS256",
      }
    );
  }

  private verifyToken(token: string): any {
    if (this.config.getEnv() == EnvTypes.PROD) {
      return jwt.verify(token, this.config.getKey(), { algorithms: ["ES256"] });
    }
    return jwt.verify(token, this.config.getJWTSecret(), {
      algorithms: ["HS256"],
    });
  }

  sing(who: Users | Devices): Promise<Connection> {
    const createdAt = Date.now();
    const tokenExpireAt = createdAt + JWTTokenLifeTimeMillis;
    const refreshTokenExpireAt =
      tokenExpireAt + JWTRefreshTokenExtraLifeTimeMillis;
    return new Promise(async (res, rej) => {
      try {
        const token = this.getToken(who, tokenExpireAt);
        const refreshToken = this.getToken(
          { parentToken: token },
          refreshTokenExpireAt
        );
        const conn = await Connection.create({
          token,
          tokenLifeTime: JWTTokenLifeTimeMillis,
          tokenExpireAt,
          refreshToken,
          refreshTokenExtraLifeTime: JWTRefreshTokenExtraLifeTimeMillis,
          refreshTokenExpireAt,
          agentId: who.getAgentId(),
          createdAt: createdAt,
        });
        res(conn);
      } catch (e) {
        rej(e);
      }
    });
  }

  verify(token: string): Users | Devices | RefreshToken {
    const agent = this.verifyToken(token);

    if (typeof agent == "string") {
      throw new Error("Invalid token");
    }

    if (typeof agent == "object") {
      return agent.data;
    }
    throw new Error("Invalid token");
  }

  decode(token: string): Users | Devices | RefreshToken {
    const agent = jwt.decode(token);
    if (typeof agent == "string") {
      throw new Error("Invalid token");
    }

    if (agent && typeof agent == "object") {
      return agent.data;
    }
    throw new Error("Invalid token");
  }

  isUser(object: unknown): object is Users {
    return (
      Object.prototype.hasOwnProperty.call(object, "id") &&
      Object.prototype.hasOwnProperty.call(object, "businessName") &&
      Object.prototype.hasOwnProperty.call(object, "userName") &&
      Object.prototype.hasOwnProperty.call(object, "password") &&
      Object.prototype.hasOwnProperty.call(object, "type") &&
      Object.prototype.hasOwnProperty.call(object, "attemptsLogin") &&
      Object.prototype.hasOwnProperty.call(object, "locked")
    );
  }

  isDevice(object: unknown): object is Devices {
    return (
      Object.prototype.hasOwnProperty.call(object, "id") &&
      Object.prototype.hasOwnProperty.call(object, "userId") &&
      Object.prototype.hasOwnProperty.call(object, "userName") &&
      Object.prototype.hasOwnProperty.call(object, "password") &&
      Object.prototype.hasOwnProperty.call(object, "attemptsLogin") &&
      Object.prototype.hasOwnProperty.call(object, "locked")
    );
  }

  isRefreshToken(object: unknown): object is RefreshToken {
    return Object.prototype.hasOwnProperty.call(object, "parentToken");
  }
}
