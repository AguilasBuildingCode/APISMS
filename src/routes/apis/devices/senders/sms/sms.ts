import express from "express";
import { v4 as uuid } from "uuid"
import DeviceInfo from "../models/device_info_model";
import DevicesStatus from "../models/device_status_model";
import Issue from "../models/issue_model";

const sms = express.Router();
const smsPath = "/sms"

sms.put("/register", async (req, res) => {
    const { model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName } = req.body
    if (typeof model != "string" && typeof id != "string" && typeof sdk != "number" && typeof manufacturer != "string" && typeof brand != "string" && typeof userName != "string" && typeof type != "string" && typeof appVersionCode != "string" && typeof board != "string" && typeof host != "string" && typeof fingerPrint != "string" && typeof appVersionName != "string") {
        res.status(400).json({ detail: "Missing and/or invalid model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, simState, simOperator, simCountryIso, simOperatorName" })
        return
    }
    const deviceInfo = await DeviceInfo.create({ apiSMSidDevice: uuid(), model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName })
    await DevicesStatus.create({ apiSMSidDevice: deviceInfo.getDataValue("apiSMSidDevice"), status: "OFFLINE" })
    res.status(200).json(deviceInfo)
})

sms.post("/online", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceId" })
        return
    }

    const deviceStatus = await DevicesStatus.update(
        { status: "ONLINE" },
        {
            where: {
                apiSMSidDevice
            }
        }
    )

    res.status(200).json({ online: deviceStatus.length > 0 })
})

sms.post("/offline", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceId" })
        return
    }

    const deviceStatus = await DevicesStatus.update(
        { status: "OFFLINE" },
        {
            where: {
                apiSMSidDevice
            }
        }
    )

    res.status(200).json({ offline: deviceStatus.length > 0 })
})

sms.post("/issue", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceId" })
        return
    }

    const { code, message, detail, path, isBodyEmpty } = req.body
    if (typeof code != "number") {
        res.status(400).json({ detail: "Missining and/or invalid code" })
        return
    }
    const issue = await Issue.create({ apiSMSidIssue: uuid(), apiSMSidDevice, code, message, detail, path, isBodyEmpty })
    res.status(200).json(issue)
})

export { sms, smsPath }