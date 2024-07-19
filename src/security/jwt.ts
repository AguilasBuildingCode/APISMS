import jwt from "jsonwebtoken"
import Config, { EnvTypes } from "../config/config"
import Connection from "../db/models/connection_model"
import Users from "../db/models/users_model"
import Devices from "../db/models/devices_model"

export interface RefreshToken {
    parentToken: string
}

export default class JWT {
    constructor(private config = Config.getInstance()) { }

    private getToken(who: Users | Devices | RefreshToken, expireAt: number): string {
        if (this.config.getEnv() == EnvTypes.PROD) {
            return jwt.sign({ data: who, exp: expireAt }, this.config.getKey(), { algorithm: "ES256" })
        }
        return jwt.sign({ data: who, exp: expireAt }, this.config.getJWTSecret(), { algorithm: "HS256" })
    }

    private verifyToken(token: string): any {
        if (this.config.getEnv() == EnvTypes.PROD) {
            return jwt.verify(token, this.config.getKey(), { algorithms: ["ES256"] })
        }
        return jwt.verify(token, this.config.getJWTSecret(), { algorithms: ["HS256"] })
    }

    sing(who: Users | Devices): Promise<Connection> {
        const expireAt = Math.floor(Date.now() / 1000) + 3600
        return new Promise(async (res, rej) => {
            try {
                const token = this.getToken(who, expireAt)
                const refreshToken = this.getToken({ parentToken: token }, expireAt + 300)
                const conn = await Connection.create({ token, refreshToken, agentId: who.getAgentId(), expireAt })
                res(conn)
            } catch (e) {
                rej(e)
            }
        })
    }

    verify(token: string): Users | Devices | RefreshToken {
        const agent = this.verifyToken(token)

        if (typeof agent == "string") {
            throw new Error("Invalid token")
        }

        if (typeof agent == "object") {
            return agent.data
        }
        throw new Error("Invalid token")
    }

    decode(token: string): Users | Devices | RefreshToken {
        const agent = jwt.decode(token)
        if (typeof agent == "string") {
            throw new Error("Invalid token")
        }

        if (agent && typeof agent == "object") {
            return agent.data
        }
        throw new Error("Invalid token")
    }

    isRefreshToken(object: unknown): object is RefreshToken {
        return Object.prototype.hasOwnProperty.call(object, "parentToken")
    }
}