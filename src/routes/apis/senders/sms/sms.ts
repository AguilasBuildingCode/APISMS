import express from "express";
import { v4 as uuid } from "uuid"
import SMSenderInfo from "../../../../models/sms_sender_info_model";
import SMSenderStatus from "../../../../models/sms_sender_status_model";
import Issue from "../../../../models/issue_model";
import SendersSMSWork from "../../../../models/senders_sms_works_model";
import SMS from "../../../../models/sms_model";
import { Op } from "sequelize";
import SMStatus from "../../../../models/sms_status_model";

const sms = express.Router();
const smsPath = "/sms"

sms.put("/register", async (req, res) => {
    const { deviceKindOfId, userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName } = req.body
    if (typeof deviceKindOfId != "string" || typeof model != "string" || typeof id != "string" || typeof sdk != "number" || typeof manufacturer != "string" || typeof brand != "string" || typeof userName != "string" || typeof type != "string" || typeof appVersionCode != "string" || typeof board != "string" || typeof host != "string" || typeof fingerPrint != "string" || typeof appVersionName != "string") {
        res.status(400).json({ detail: "Missing and/or invalid model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, simState, simOperator, simCountryIso, simOperatorName" })
        return
    }

    const smsSender = await SMSenderInfo.findAll({
        where: {
            deviceKindOfId, userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName
        }
    })

    if (smsSender.length > 0) {
        res.status(400).json({ detail: "SMS Sender already registred" })
        return
    }

    await Promise.all([
        await SMSenderInfo.create({ deviceKindOfId, userId, model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, carrierIdFromSimMccMnc, simCarrierId, simCarrierIdName, simState, simOperator, simCountryIso, simOperatorName, simSpecificCarrierIdName }),
        await SMSenderStatus.create({ deviceKindOfId, status: "OFFLINE" }),
        await SendersSMSWork.create({ deviceKindOfId }),
    ])
    res.status(200).json({})
})

sms.post("/online", async (req, res) => {
    const { deviceKindOfId } = req.body
    if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" })
        return
    }

    try {
        const [deviceStatus] = await SMSenderStatus.update(
            { status: "ONLINE" },
            {
                where: {
                    deviceKindOfId
                }
            }
        )

        if (deviceStatus > 0) {
            res.status(200).json({})
            return
        }

        res.status(404).json({ detail: "Invalid device" })
    } catch (e: any) {
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
    const { deviceKindOfId, apiSMSId } = req.body

    if (typeof apiSMSId != "string" || apiSMSId == "") {
        res.status(400).json({ detail: "Missing or invalid apiSMSId" })
        return
    }

    try {
        const [isReceived] = await SMS.update({
            deviceNotified: true,
        }, {
            where: {
                [Op.and]: [{ apiSMSId }, { deviceKindOfId }]
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
    const { deviceKindOfId, apiSMSId, smsId, partNumber, totalParts, newStatus } = req.body
    if (typeof apiSMSId != "string" && typeof smsId != "string" && typeof partNumber != "number" && typeof totalParts == "number" &&
        typeof newStatus != "string") {
        res.status(400).json({ detail: "Missing argument/s apiSMSId, smsId, partNumber, totalParts, newStatus" })
        return
    }

    try {
        const smsStatus = await SMStatus.create({ statusId: uuid(), apiSMSId, smsId, deviceKindOfId, partNumber, totalParts, newStatus })

        const [currentWork] = await SendersSMSWork.findOrCreate({
            where: {
                deviceKindOfId
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
    const { deviceKindOfId } = req.body
    if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" })
        return
    }

    try {
        const [deviceStatus] = await SMSenderStatus.update(
            { status: "OFFLINE" },
            {
                where: {
                    deviceKindOfId
                }
            }
        )

        if (deviceStatus > 0) {
            res.status(200).send({})
            return
        }

        res.status(404).json({ detail: "Invalid device" })
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

sms.post("/issue", async (req, res) => {
    const { deviceKindOfId } = req.body
    if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
        res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" })
        return
    }

    const { code, message, detail, path, isBodyEmpty } = req.body
    if (typeof code != "number") {
        res.status(400).json({ detail: "Missining and/or invalid code" })
        return
    }

    try {
        const issue = await Issue.create({ apiSMSidIssue: uuid(), deviceKindOfId, code, message, detail, path, isBodyEmpty })
        res.status(200).json(issue)
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

export { sms, smsPath }