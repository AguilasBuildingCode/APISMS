import express, { RequestHandler } from "express";
import JWT from "../../jwt/jwt";
import Users from "./models/users_model";
import Connection from "./models/connection_model";
import authMiddleware from "../middlewares/auth_middleware";

const jwt = new JWT()
const auth = express.Router();
const authPath = "/auth"

const loginMiddleware: RequestHandler<any> = async (req, res, next) => {
    const { userId, userName, password } = req.body
    if (typeof userId == "string" && typeof userName == "string" && typeof password == "string") {

        const currentConn = await Connection.findOne({
            attributes: ["expireAt"],
            where: {
                userId,
                deleted: false,
            },
            order: [
                ["expireAt", "DESC"]
            ]
        })

        if (currentConn && jwt.isConnValid(currentConn)) {
            const expireAt = currentConn.getDataValue("expireAt")
            res.status(401).json({ detail: "Your connection already is valid", expireAt, retryAt: expireAt - 300 })
            return
        }
        next()
        return
    }

    authMiddleware(req, res, next)
}

auth.post("/login", async (req, res) => {
    console.log(JSON.stringify({ body: req.body }))
    const { userId, userName, password, currentConn } = req.body
    try {
        if (currentConn && jwt.isConnValid(currentConn)) {
            const expireAt = currentConn.getDataValue("expireAt")
            res.status(401).json({ detail: "Your connection already is valid", expireAt, retryAt: expireAt - 300 })
            return
        }

        const user = await Users.findByPk(userId)

        if (!user) {
            res.status(401).json({ detail: "Invalid userId and/or userName and/or password" })
            return
        }

        if (Boolean(user.getDataValue("locked"))) {
            res.status(401).json({ detail: "User locked by exced attempt login limit" })
            return
        }

        if (userName != user.getDataValue("userName") || password != user.getDataValue("password")) {
            const attemptsLogin = Number(user.getDataValue("attemptsLogin")) + 1
            Users.update({
                attemptsLogin,
                locked: attemptsLogin >= 3,
            }, {
                where: {
                    userId
                }
            })
            res.status(401).json({ detail: "Invalid userId and/or userName and/or password" })
            return
        }

        const conn = await jwt.sing(user)
        res.status(200).json(conn)
    } catch (e: any) {
        console.log(e)
        res.status(500).json({ detail: e.message })
    }
})

auth.post("/valid", async (_, res) => {
    res.status(200).send({})
})

auth.post("/logout", async (req, res) => {
    const { token } = req.body

    try {
        const [logout] = await Connection.update({
            deleted: true
        }, {
            where: {
                token
            }
        })

        if (logout > 0) {
            res.status(200).send({})
            return
        }
        res.status(404).json({ detail: "Invalid token" })
    } catch (e: any) {
        console.log(e)
        res.status(500).json({ detail: e.message })
    }
})

export { auth, authPath, loginMiddleware }