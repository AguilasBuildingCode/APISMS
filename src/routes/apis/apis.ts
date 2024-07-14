import { devices, devicesPath } from "./devices/devices";
import express from "express";
import { sms, smsPath } from "./sms/sms";
const apis = express.Router();
const apisPath = "/apis"

apis.use(smsPath, sms)
apis.use(devicesPath, devices)

export { apis, apisPath }