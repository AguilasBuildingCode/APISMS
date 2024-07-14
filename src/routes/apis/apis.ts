import { devices, devicesPath } from "./devices/devices";
import express, { RequestHandler } from "express";
import { sms, smsPath } from "./sms/sms";
import JWT from "../../jwt/jwt";

const jwt = new JWT()
const apis = express.Router();
const apisPath = "/apis"

const apiMiddleware: RequestHandler<any> = (req, res, next) => {
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
        const tokenRes = jwt.verify(splitedToke[1])
        req.body = { ...tokenRes, ...req.body }
        next()
    } catch (e) {
        console.error(e)
        res.status(401).json({ detail: JSON.stringify(e) })
    }
}

apis.use(smsPath, apiMiddleware, sms)
apis.use(devicesPath, apiMiddleware, devices)

export { apis, apisPath }