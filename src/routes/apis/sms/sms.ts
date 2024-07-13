import { v4 as uuid } from "uuid"
import express from "express";
import io from "../../..";
import SMS from "./models/sms_model";
import SMStatus from "./models/sms_status_model";
import { Op } from "sequelize";

const sms = express.Router();
const smsPath = "/sms"

sms.put("/send", async (req, res) => {
    const { countryCode, number, message } = req.body
    if (typeof countryCode == 'string' && typeof number == 'string' && typeof message == 'string') {
        if (countryCode.length != 2 || number.length != 10 || message.length == 0) {
            res.status(400).json({ detail: "Wrong countryCode and/or number and/or message length" })
            return
        }

        const currentSMS = await SMS.create({ apiSMSId: uuid(), countryCode, number, message })
        const { baseUrl, path } = req
        io.emit(`${baseUrl}${path}`, currentSMS)
        res.status(200).json(currentSMS);
        return
    }
    res.status(400).json({ detail: "Missing argument/s countryCode, number, message" })
})

sms.post("/update", async (req, res) => {
    console.log(JSON.stringify(req.rawHeaders))
    const { apiSMSId, smsId, partNumber, totalParts, newStatus } = req.body
    if (typeof apiSMSId != "string" && typeof smsId != "string" && typeof partNumber != "number" && typeof totalParts == "number" &&
        typeof newStatus != "string") {
        res.status(400).json({ detail: "Missing argument/s apiSMSId, smsId, partNumber, totalParts, newStatus" })
        return
    }

    const smsStatus = await SMStatus.create({ statusId: uuid(), apiSMSId, smsId, partNumber, totalParts, newStatus })
    res.status(200).json(smsStatus)
})

sms.post("/pending", async (req, res) => {
    const { apiSMSIdsPending } = req.body
    if (!(apiSMSIdsPending instanceof Array) || apiSMSIdsPending.length == 0) {
        res.status(400).json({ detail: "Missing o invalid apiSMSIdsPending" })
        return
    }

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
})

export { sms, smsPath }