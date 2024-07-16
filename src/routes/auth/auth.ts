import express, { RequestHandler } from "express";
import JWT from "../../jwt/jwt";
import Connection from "../../models/connection_model";
import authValidateMiddleware from "../../middlewares/auth_validate_middleware";
import Users from "../../models/users_model";
import Devices from "../../models/devices_model";

const jwt = new JWT()
const auth = express.Router();
const authPath = "/auth"

const authMiddleware: RequestHandler<any> = async (req, res, next) => {
    const { agentId, userName, password } = req.body
    if (typeof agentId == "string" && typeof userName == "string" && typeof password == "string") {

        const currentConn = await Connection.findOne({
            attributes: ["expireAt"],
            where: {
                agentId,
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

    authValidateMiddleware(req, res, next)
}

auth.post("/login", async (req, res) => {
    console.log(JSON.stringify({ body: req.body }))
    const { agentId, userName, password, currentConn } = req.body
    try {
        if (currentConn && jwt.isConnValid(currentConn)) {
            const expireAt = currentConn.getDataValue("expireAt")
            res.status(401).json({ detail: "Your connection already is valid", expireAt, retryAt: expireAt - 300 })
            return
        }

        const agent = (await Users.findByPk(agentId)) ?? (await Devices.findByPk(agentId))

        if (!agent) {
            res.status(401).json({ detail: "Invalid agentId and/or userName and/or password" })
            return
        }

        if (Boolean(agent.getDataValue("locked"))) {
            res.status(401).json({ detail: "User locked by exced attempt login limit" })
            return
        }

        if (userName != agent.getDataValue("userName") || password != agent.getDataValue("password")) {
            const attemptsLogin = Number(agent.getDataValue("attemptsLogin")) + 1
            agent.update({
                attemptsLogin,
                locked: attemptsLogin >= 3,
            })
            res.status(401).json({ detail: "Invalid userId and/or userName and/or password" })
            return
        }

        const conn = await jwt.sing(agent)
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

export { auth, authPath, authMiddleware }