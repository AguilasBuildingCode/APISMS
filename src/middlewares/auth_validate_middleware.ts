import { RequestHandler } from "express"
import JWT from "../jwt/jwt"
import Connection from "../models/connection_model"

const jwt = new JWT()
const authValidateMiddleware: RequestHandler<any> = async (req, res, next) => {
    const token = req.header("Authorization")
    if (typeof token != "string" || !token.startsWith("Bearer")) {
        res.status(400).json({ detail: "Missing and/or invalid token" })
        return
    }

    const splitedToke = token.split(" ")
    if (splitedToke.length != 2) {
        res.status(400).json({ detail: "Missing and/or invalid token" })
        return
    }

    try {
        const currentConn = await Connection.findOne({
            attributes: ["expireAt"],
            where: {
                token: splitedToke[1],
                deleted: false
            }
        })

        if (!currentConn) {
            res.status(401).json({ detail: "Invalid token" })
            return
        }

        if (jwt.isConnNotValid(currentConn)) {
            res.status(401).json({ detail: "Your connection expired", })
            return
        }

        const agent = jwt.verify(splitedToke[1])
        req.body = { ...agent, token: splitedToke[1], currentConn, ...req.body }
        next()
    } catch (e: any) {
        res.status(401).json({ detail: e.message })
    }
}

export default authValidateMiddleware