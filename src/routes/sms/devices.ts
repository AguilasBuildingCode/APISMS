import express from "express";
import { v4 as uuid } from "uuid"

const devices = express.Router();
const devicesPath = "devices"

devices.put("/register", (_req, res) => {
    res.status(200).json({ deviceId: uuid() })
})

devices.post("/online", (req, res) => {
    const { deviceId } = req.body
    if (typeof deviceId == "string") {
        res.status(200).json({ token: uuid() })
        return
    }
    res.status(400).send()
})

export { devices, devicesPath }