import express from "express";
import { user, userPath } from "./user/user";
import { device, devicePath } from "./device/device";
import userValidateMiddleware from "../../../middlewares/user_validate_middleware";
import deviceValidateMiddleWare from "./device/senders/middlewares/device_validate_middleware";

const v1 = express.Router();
const v1Path = "/v1"

v1.use(userPath, userValidateMiddleware, user)
v1.use(devicePath, deviceValidateMiddleWare, device)

export { v1, v1Path }