import express from "express";
import Devices from "../../../../models/devices_model";
import Encrypt from "../../../../security/encrypt";
import { v4 as uuid } from 'uuid';

const admon = express.Router();
const admonPath = "/admon"

admon.put("/devices", async (req, res) => {
    const { userId, kind, userName, password } = req.body

    if (typeof kind != "string" || typeof userName != "string" || typeof password != "string" || password.length < 8) {
        res.status(400).json({ detail: "Missing or invalid kind and/or userName and\or password" })
        return
    }

    try {
        const tmpUserName = await Encrypt.hash(userName)
        const tmpPassword = await Encrypt.hash(password)

        const device = await Devices.create({ deviceId: uuid(), userId, deviceKindOfId: uuid(), kind, userName: tmpUserName, password: tmpPassword })
        res.status(200).json(device.asUserInfo())
    } catch (e: any) {
        console.error(e)
        res.status(400).json({ detail: e.message })
    }
})

export { admon, admonPath }