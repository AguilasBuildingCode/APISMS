import express from "express";
import { v1, v1Path } from "./v1/v1";

const apis = express.Router();
const apisPath = "/apis"

apis.use(v1Path, v1)

export { apis, apisPath }