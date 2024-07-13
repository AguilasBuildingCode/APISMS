import express from "express";
import { sendersPath, senders } from "./senders/senders"

const devices = express.Router();
const devicesPath = "/devices"

devices.use(sendersPath, senders)

export { devices, devicesPath }