import jwt from "jsonwebtoken"
import Config, { EnvTypes } from "../config/config"
import Users from "../routes/auth/models/users_model"
import Connection from "../routes/auth/models/connection_model"

export default class JWT {
    constructor(private config = Config.getInstance()) { }

    private getToken(who: Users, expireAt: number): string {
        if (this.config.getEnv() == EnvTypes.PROD) {
            return jwt.sign({ data: who, exp: expireAt }, this.config.getKey(), { algorithm: "RS512" })
        }
        return jwt.sign({ data: who, exp: expireAt }, this.config.getJWTSecret(), { algorithm: "HS256" })
    }

    private verifyToken(token: string): any {
        if (this.config.getEnv() == EnvTypes.PROD) {
            return jwt.verify(token, this.config.getKey(), { algorithms: ["RS512"] })
        }
        return jwt.verify(token, this.config.getJWTSecret(), { algorithms: ["HS256"] })
    }

    isConnValid(lastConn: Connection): boolean {
        const nowLess5Min = Math.floor(Date.now() / 1000) - 300 // Less 5 min
        const lastConnExpireAt = Number(lastConn.getDataValue("expireAt"))
        return lastConnExpireAt > nowLess5Min
    }

    isConnNotValid(lastConn: Connection): boolean {
        return !this.isConnValid(lastConn)
    }

    sing(who: Users): Promise<Connection> {
        const expireAt = Math.floor(Date.now() / 1000) + 3600
        return new Promise(async (res, rej) => {
            try {
                const token = this.getToken(who, expireAt)
                const conn = await Connection.create({ token, userId: who.getDataValue("userId"), expireAt })
                res(conn)
            } catch (e) {
                rej(e)
            }
        })
    }

    verify(token: string): Users {
        const user = this.verifyToken(token)

        if (typeof user == "string") {
            throw new Error("Invalid token")
        }

        if (typeof user == "object") {
            return user.data as Users
        }
        throw new Error("Invalid token")
    }
}