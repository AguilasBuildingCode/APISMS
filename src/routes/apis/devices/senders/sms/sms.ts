import express from "express";
import { v4 as uuid } from "uuid"
import DeviceInfo from "../../../models/device_info_model";
import DevicesStatus from "../../../models/device_status_model";
import Issue from "../../../models/issue_model";
import SendersSMSWork from "../../../models/senders_sms_works_model";
import SMS from "../../../models/sms_model";
import { Op } from "sequelize";
import SMStatus from "../../../models/sms_status_model";

const sms = express.Router();
const smsPath = "/sms"

sms.put("/register", async (req, res) => {
    const { userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName } = req.body
    if (typeof model != "string" && typeof id != "string" && typeof sdk != "number" && typeof manufacturer != "string" && typeof brand != "string" && typeof userName != "string" && typeof type != "string" && typeof appVersionCode != "string" && typeof board != "string" && typeof host != "string" && typeof fingerPrint != "string" && typeof appVersionName != "string") {
        res.status(400).json({ detail: "Missing and/or invalid model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, simState, simOperator, simCountryIso, simOperatorName" })
        return
    }

    const devices = await DeviceInfo.findAll({
        where: {
            userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName
        }
    })

    if (devices.length > 0) {
        res.status(400).json({ detail: "Device already registred" })
        return
    }

    const apiSMSidDevice = uuid()
    const [deviceInfo] = await Promise.all([
        await DeviceInfo.create({ apiSMSidDevice, userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName }),
        await DevicesStatus.create({ apiSMSidDevice, status: "OFFLINE" }),
        await SendersSMSWork.create({ apiSMSidDevice }),
    ])
    res.status(200).json(deviceInfo)
})

sms.post("/online", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceId" })
        return
    }

    try {
        const [deviceStatus] = await DevicesStatus.update(
            { status: "ONLINE" },
            {
                where: {
                    apiSMSidDevice
                }
            }
        )

        if (deviceStatus > 0) {
            res.status(200).json({})
            return
        }

        res.status(404).json({ detail: "Invalid device" })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ detail: e.message })
    }
})

sms.post("/pending", async (req, res) => {
    const { apiSMSIdsPending } = req.body
    if (!(apiSMSIdsPending instanceof Array) || apiSMSIdsPending.length == 0) {
        res.status(400).json({ detail: "Missing o invalid apiSMSIdsPending" })
        return
    }

    try {
        const smsPendings = (await SMStatus.findAll({
            attributes: ['apiSMSId'],
            group: ['apiSMSId'],
            where: {
                apiSMSId: {
                    [Op.in]: apiSMSIdsPending
                }
            }
        })).map((smsPendings) => smsPendings.getDataValue('apiSMSId'))
        res.status(200).json({ apiSMSIdsPending: apiSMSIdsPending.filter(apiSMSId => !smsPendings.includes(apiSMSId)) })
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

sms.put("/received", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    const { apiSMSId } = req.body

    if (typeof apiSMSId != "string" || apiSMSId == "") {
        res.status(400).json({ detail: "Missing or invalid apiSMSId" })
        return
    }

    try {
        const [isReceived] = await SMS.update({
            deviceNotified: true,
        }, {
            where: {
                [Op.and]: [{ apiSMSId }, { apiSMSidDevice }]
            }
        })

        if (isReceived > 0) {
            res.status(200).json({})
            return
        }

        res.status(404).json({ detail: "Invalid apiSMSId" })
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

sms.post("/update", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    const { apiSMSId, smsId, partNumber, totalParts, newStatus } = req.body
    if (typeof apiSMSId != "string" && typeof smsId != "string" && typeof partNumber != "number" && typeof totalParts == "number" &&
        typeof newStatus != "string") {
        res.status(400).json({ detail: "Missing argument/s apiSMSId, smsId, partNumber, totalParts, newStatus" })
        return
    }

    try {
        const smsStatus = await SMStatus.create({ statusId: uuid(), apiSMSId, smsId, apiSMSidDevice, partNumber, totalParts, newStatus })

        const [currentWork] = await SendersSMSWork.findOrCreate({
            where: {
                apiSMSidDevice
            }
        })
        switch (newStatus) {
            case "SEND":
                currentWork.update({
                    smsSend: currentWork.getDataValue("smsSend") + 1
                })
                break
            case "DELIVERED":
                currentWork.update({
                    smsDelivered: currentWork.getDataValue("smsDelivered") + 1
                })
                break
            case "FAIL":
                currentWork.update({
                    smsFailed: currentWork.getDataValue("smsFailed") + 1
                })
                break
        }

        res.status(200).json(smsStatus)
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

sms.post("/offline", async (req, res) => {
    const apiSMSidDevice = req.header("apiSMSidDevice")
    if (typeof apiSMSidDevice != "string" || apiSMSidDevice == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceId" })
        return
    }

    try {
        const [deviceStatus] = await DevicesStatus.update(
            { status: "OFFLINE" },
            {
                where: {
                    apiSMSidDevice
                }
            }
        )

        if (deviceStatus > 0) {
            res.status(200).send({})
            return
        }

        res.status(404).json({ detail: "Invalid device" })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({ detail: e.message })
    }
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

    try {
        const issue = await Issue.create({ apiSMSidIssue: uuid(), apiSMSidDevice, code, message, detail, path, isBodyEmpty })
        res.status(200).json(issue)
    } catch (e: any) {
        console.log(e)
        res.status(500).json({ detail: e.message })
    }
})

export { sms, smsPath }