import express from "express";
import JWT from "../../jwt/jwt";
import Users from "./models/users_model";
import Connection from "./models/connection_model";

const jwt = new JWT()
const auth = express.Router();
const authPath = "/auth"

auth.post("/login",
    (req, res, next) => {

        console.log(JSON.stringify(req.body))
        console.log(JSON.stringify(req.rawHeaders))

        const { userId, userName, password } = req.body
        if (typeof userId == "string" && typeof userName == "string" && typeof password == "string") {
            next()
            return
        }

        const token = req.header("Authorization")
        if (typeof token != "string" || !token.startsWith("Bearer")) {
            res.status(400).json({ detail: "Missing and/or invalid token or userId and/or userName and/or password" })
            return
        }

        const splitedToke = token.split(" ")
        if (splitedToke.length != 2) {
            res.status(400).json({ detail: "Missing and/or invalid token" })
            return
        }

        try {
            const tokenRes = jwt.verify(splitedToke[1])
            req.body = { userId: tokenRes.getDataValue("userId"), userName: tokenRes.getDataValue("userName"), password: tokenRes.getDataValue("password") }
            next()
        } catch (e) {
            console.error(e)
            res.status(401).json({ detail: JSON.stringify(e) })
        }
    }, async (req, res) => {

        console.log(JSON.stringify(req.body))

        const { userId, userName, password } = req.body
        try {
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

            const lastConn = await Connection.findOne({
                attributes: ["expireAt"],
                where: {
                    userId
                },
                order: [
                    ['expireAt', 'DESC']
                ]
            })

            if (lastConn && jwt.isConnNotValid(lastConn)) {
                res.status(401).json({ detail: "Your connection already is valid", expireAt: Number(lastConn.getDataValue("expireAt")), retryAt: Number(lastConn.getDataValue("expireAt")) - 300 })
                return
            }

            const conn = await jwt.sing(user)
            res.status(200).json(conn)
        } catch (e) {
            res.status(500).json({ detail: JSON.stringify(e) })
            console.log(e)
        }
    })

export { auth, authPath }