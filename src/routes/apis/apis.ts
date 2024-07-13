import express from "express";
import { sms, smsPath } from "./sms/sms";
import { devices, devicesPath } from "./devices/devices";

const apis = express.Router();
const apisPath = "/apis"

apis.use(smsPath, sms)
apis.use(devicesPath, devices)

export { apis, apisPath }