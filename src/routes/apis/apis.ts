import express from "express";
import { sms, smsPath } from "./sms/sms";
import { admon, admonPath } from "./admon/admon";
import { senders, sendersPath } from "./senders/senders";
import sendersMiddleWare from "./senders/middlewares/senders_middleware";
const apis = express.Router();
const apisPath = "/apis"

apis.use(admonPath, admon)
apis.use(smsPath, sms)
apis.use(sendersPath, sendersMiddleWare, senders)

export { apis, apisPath }