import express from "express";
import { sms, smsPath } from "./sms/sms";

const senders = express.Router();
const sendersPath = "/senders"


senders.use(smsPath, sms)

export { senders, sendersPath }