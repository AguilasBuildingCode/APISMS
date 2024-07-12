import { v4 as uuid } from "uuid"
import express from "express";
import io from "../..";

const send = express.Router();
const sendPath = "send"

send.put("/", (req, res) => {
    const { countryCode, number, message } = req.body
    if (typeof countryCode == 'string' && typeof number == 'string' && typeof message == 'string') {
        const { baseUrl, path } = req
        io.emit(`${baseUrl}${path}`, { id: uuid(), countryCode, number, message })
        res.status(200).json({ path: `${baseUrl}${path}` });
        return
    }
    res.status(400).json();
});

send.post("/update", (req, res) => {
    console.log(JSON.stringify(req.rawHeaders))
    const { apiSMSId, smsId, partNumber, totalParts, newStatus } = req.body
    if (typeof apiSMSId != "string" && typeof smsId != "string" && typeof partNumber != "number" && typeof totalParts == "number" &&
        typeof newStatus != "string") {
            res.status(400).send()
            return
    }

    console.log(JSON.stringify(req.body))
    res.status(200).json()
})

send.post("/pending", (req, res) => {
    console.log(JSON.stringify(req.rawHeaders))
    console.log(JSON.stringify(req.body))
    res.status(200).json()
})

export { send, sendPath }