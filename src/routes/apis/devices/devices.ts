import express, { RequestHandler } from "express";
import { sendersPath, senders } from "./senders/senders"

const devices = express.Router();
const devicesPath = "/devices"
const devicesMiddleware: RequestHandler<any> = (req, res, next) => {
    if (req.originalUrl == "/apis/devices/senders/sms/register") {
        next()
        return
    }
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missing or invalid apiSMSidDevice" })
        return
    }
    next()
}

devices.use(sendersPath, senders)

export { devices, devicesPath, devicesMiddleware }