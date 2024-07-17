import express from "express";
import { sms, smsPath } from "./sms/sms";
import { admon, admonPath } from "./admon/admon";
import { senders, sendersPath } from "./senders/senders";
import sendersValidateMiddleWare from "./senders/middlewares/senders_validate_middleware";
import userValidateMiddleware from '../../middlewares/user_validate_middleware';

const apis = express.Router();
const apisPath = "/apis"

apis.use(admonPath, userValidateMiddleware, admon)
apis.use(smsPath, userValidateMiddleware, sms)
apis.use(sendersPath, sendersValidateMiddleWare, senders)

export { apis, apisPath }