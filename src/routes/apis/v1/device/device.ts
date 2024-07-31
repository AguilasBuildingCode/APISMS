import express from "express";
import { senders, sendersPath } from "./senders/senders";

const device = express.Router();
const devicePath = "/device"

device.use(sendersPath, senders)

export { device, devicePath }