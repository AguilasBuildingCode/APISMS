import { v4 as uuid } from "uuid"
import express from "express";
import SMS from "../../../../models/sms_model";

const sms = express.Router();
const smsPath = "/sms"

sms.put("/send", async (req, res) => {
    const { countryCode, number, message } = req.body
    if (typeof countryCode != 'string' && typeof number != 'string' && typeof message != 'string') {
        res.status(400).json({ detail: "Missing or invalid countryCode and/or number and/or message length" })
        return
    }

    if (countryCode.length != 2 || number.length != 10 || message.length == 0) {
        res.status(400).json({ detail: "Missing or invalid countryCode and/or number and/or message length" })
        return
    }

    try {
        const currentSMS = await SMS.create({ apiSMSId: uuid(), countryCode, number, message })
        res.status(200).json({ apiSMSId: currentSMS.getDataValue("apiSMSId"), createdAt: currentSMS.getDataValue("createdAt") });
    } catch (e: any) {
        res.status(500).json({ detail: e.message })
    }
})

export { sms, smsPath }