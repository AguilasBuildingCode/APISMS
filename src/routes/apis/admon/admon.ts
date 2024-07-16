import express from "express";
import Devices from "../../../models/devices_model";

const admon = express.Router();
const admonPath = "/admon"

admon.put("/devices", async (req, res) => {
    const { userId, kind, userName, password } = req.body

    if (typeof kind != "string" || typeof userName != "string" || typeof password != "string" || password.length < 8) {
        res.status(400).json({ detail: "Missing or invalid kind and/or userName and\or password" })
        return
    }

    try {
        const alreadyRegister = await Devices.findOne({
            where: {
                kind,
                userName,
                password,
            }
        })

        if (alreadyRegister) {
            res.status(400).json({ detail: `This password already use with this kind "${kind}"` })
            return
        }

        const device = await Devices.create({ userId, kind, userName, password })
        res.status(200).json(device.asUserInfo())
    } catch (e: any) {
        res.status(400).json({ detail: e.message })
    }
})

export { admon, admonPath }