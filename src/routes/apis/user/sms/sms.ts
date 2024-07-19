import { v4 as uuid } from "uuid";
import express from "express";
import SMS from "../../../../db/models/sms_model";
import Encrypt from "../../../../security/encrypt";
import SMSendersWork from "../../../../db/models/sms_senders_works_model";
import { SendersSMStatus } from "../../../../enums/senders_sms_status";
import io from "../../../..";
import Devices from "../../../../db/models/devices_model";
import { smsSequelize } from "../../../../db/sequelize";

const sms = express.Router();
const smsPath = "/sms";

sms.put("/send", async (req, res) => {
  const { id, countryCode, number, message } = req.body;
  if (
    typeof countryCode != "string" ||
    countryCode.length != 2 ||
    typeof number != "string" ||
    number.length != 10 ||
    typeof message != "string" ||
    message.length == 0
  ) {
    res.status(400).json({
      detail: "Missing or invalid countryCode and/or number and/or message",
    });
    return;
  }

  try {
    const betterSender = await SMSendersWork.findOne({
      attributes: ["deviceKindOfId", "smsTotal", "smsPending"],
      where: {
        status: SendersSMStatus.ONLINE,
      },
      include: {
        attributes: [],
        model: Devices,
        where: {
          userId: id,
        },
      },
      order: smsSequelize.random(),
    });

    if (!betterSender) {
      res.status(404).json({ detail: "No SMS senders found." });
      return;
    }

    const deviceKindOfId = betterSender.getDataValue("deviceKindOfId");
    const currentSMS = await SMS.create({
      id: uuid(),
      userId: id,
      deviceKindOfId,
      countryCode,
      number: Encrypt.encrypt(number),
      message: Encrypt.encrypt(message),
    });

    io.emit(`${deviceKindOfId}-sms-to-send`, {
      smsId: currentSMS.getDataValue("id"),
      countryCode,
      number,
      message,
    });
    betterSender.update({
      smsTotal: Number(betterSender.getDataValue("smsTotal")) + 1,
      smsPending: Number(betterSender.getDataValue("smsPending")) + 1,
    });
    res.status(200).json(currentSMS.asUserInfo());
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

export { sms, smsPath };
