import express from "express";
import { send, sendPath } from "./send";
import { devices, devicesPath } from "./devices";

const sms = express.Router();
const smsPath = "sms"

sms.use(`/${smsPath}/${sendPath}`, send)
sms.use(`/${smsPath}/${devicesPath}`, devices)


export { sms }