import { RequestHandler } from "express";

const sendersMiddleWare: RequestHandler<any> = (req, res, next) => {
    const { deviceId, userId, deviceKindOfId, kind, userName, password, attemptsLogin } = req.body
    if (typeof deviceId != "string" || typeof userId != "string" || typeof deviceKindOfId != "string" || typeof kind != "string" || typeof userName != "string" || typeof password != "string" || typeof attemptsLogin != "number") {
        res.status(403).json({ detail: "Invalid token" })
        return
    }
    next()
}

export default sendersMiddleWare