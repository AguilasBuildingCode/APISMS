import express from "express";
import { v4 as uuid } from "uuid"

const devices = express.Router();
const devicesPath = "devices"

devices.put("/register", (_req, res) => {
    res.status(200).json({ deviceId: uuid() })
})

devices.post("/online", (req, res) => {
    console.log(JSON.stringify(req.rawHeaders))
    res.status(200).json({ token: uuid() })
})

devices.post("/offline", (req, res) => {
    console.log(JSON.stringify(req.rawHeaders))
    res.status(200).json({ token: uuid() })
})

export { devices, devicesPath }