import express from "express";
import deviceValidateMiddleWare from "./device/senders/middlewares/device_validate_middleware";
import userValidateMiddleware from '../../middlewares/user_validate_middleware';
import { user, userPath } from "./user/user";
import { device, devicePath } from "./device/device";

const apis = express.Router();
const apisPath = "/apis"

apis.use(userPath, userValidateMiddleware, user)
apis.use(devicePath, deviceValidateMiddleWare, device)

export { apis, apisPath }