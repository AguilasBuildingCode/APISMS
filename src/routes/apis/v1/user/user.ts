import express from "express";
import { admon, admonPath } from "./admon/admon";
import { sms, smsPath } from "./sms/sms";

const user = express.Router();
const userPath = "/user"

user.use(admonPath, admon)
user.use(smsPath, sms)

export { user, userPath }