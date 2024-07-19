import express from "express";
import { v4 as uuid } from "uuid";
import SMSenderInfo from "../../../../../db/models/sms_sender_info_model";
import Issue from "../../../../../db/models/issue_model";
import SMSendersWork from "../../../../../db/models/sms_senders_works_model";
import { Op } from "sequelize";
import SMStatus from "../../../../../db/models/sms_status_model";
import { DeviceTypes } from "../../../../../enums/devices_types";
import { SendersSMStatus } from "../../../../../enums/senders_sms_status";
import Encrypt from "../../../../../security/encrypt";

const sms = express.Router();
const smsPath = "/sms";

sms.put("/register", async (req, res) => {
  const {
    deviceKindOfId,
    kind,
    userId,
    model,
    id,
    sdk,
    manufacturer,
    brand,
    userName,
    type,
    appVersionCode,
    board,
    host,
    fingerPrint,
    appVersionName,
    carrierIdFromSimMccMnc,
    simCarrierId,
    simCarrierIdName,
    simState,
    simOperator,
    simCountryIso,
    simOperatorName,
    simSpecificCarrierIdName,
  } = req.body;
  if (
    typeof deviceKindOfId != "string" ||
    typeof kind != "string" ||
    typeof model != "string" ||
    typeof id != "string" ||
    typeof sdk != "number" ||
    typeof manufacturer != "string" ||
    typeof brand != "string" ||
    typeof userName != "string" ||
    typeof type != "string" ||
    typeof appVersionCode != "string" ||
    typeof board != "string" ||
    typeof host != "string" ||
    typeof fingerPrint != "string" ||
    typeof appVersionName != "string"
  ) {
    res.status(400).json({
      detail:
        "Missing and/or invalid model, id, sdk, manufacturer, brand, userName, type, appVersionCode, board, host, fingerPrint, appVersionName, simState, simOperator, simCountryIso, simOperatorName",
    });
    return;
  }

  if (kind != DeviceTypes.SMS_SENDER) {
    res.status(403).json({ detail: "Invalid device" });
    return;
  }

  const smsSender = await SMSenderInfo.findAll({
    where: {
      deviceKindOfId,
      userId,
      model,
      id,
    },
  });

  if (smsSender.length > 0) {
    res.status(400).json({ detail: "SMS Sender already registred" });
    return;
  }

  await Promise.all([
    await SMSenderInfo.create({
      deviceKindOfId,
      userId,
      model,
      id,
      sdk: Encrypt.encrypt(sdk),
      manufacturer: Encrypt.encrypt(manufacturer),
      brand: Encrypt.encrypt(brand),
      userName: Encrypt.encrypt(userName),
      type: Encrypt.encrypt(type),
      appVersionCode: Encrypt.encrypt(appVersionCode),
      board: Encrypt.encrypt(board),
      host: Encrypt.encrypt(host),
      fingerPrint: Encrypt.encrypt(fingerPrint),
      appVersionName: Encrypt.encrypt(appVersionName),
      carrierIdFromSimMccMnc: Encrypt.encrypt(carrierIdFromSimMccMnc),
      simCarrierId: Encrypt.encrypt(simCarrierId),
      simCarrierIdName: Encrypt.encrypt(simCarrierIdName),
      simState: Encrypt.encrypt(simState),
      simOperator: Encrypt.encrypt(simOperator),
      simCountryIso,
      simOperatorName: Encrypt.encrypt(simOperatorName),
      simSpecificCarrierIdName: Encrypt.encrypt(simSpecificCarrierIdName),
    }),
    await SMSendersWork.create({ deviceKindOfId, userId }),
  ]);
  res.status(200).json({});
});

sms.post("/online", async (req, res) => {
  const { deviceKindOfId } = req.body;
  if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
    res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" });
    return;
  }

  try {
    const [deviceStatus] = await SMSendersWork.update(
      { status: SendersSMStatus.ONLINE },
      {
        where: {
          deviceKindOfId,
        },
      }
    );

    if (deviceStatus > 0) {
      res.status(200).json({});
      return;
    }

    res.status(404).json({ detail: "Invalid device" });
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/pending", async (req, res) => {
  const { apiSMSIdsPending } = req.body;
  if (!(apiSMSIdsPending instanceof Array) || apiSMSIdsPending.length == 0) {
    res.status(400).json({ detail: "Missing o invalid apiSMSIdsPending" });
    return;
  }

  try {
    const smsPendings = (
      await SMStatus.findAll({
        attributes: ["smsId"],
        group: ["smsId"],
        where: {
          smsId: {
            [Op.in]: apiSMSIdsPending,
          },
        },
      })
    ).map((smsPendings) => smsPendings.getDataValue("smsId"));
    res.status(200).json({
      apiSMSIdsPending: apiSMSIdsPending.filter(
        (smsId) => !smsPendings.includes(smsId)
      ),
    });
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/update", async (req, res) => {
  const {
    deviceKindOfId,
    smsId,
    smsLocalId,
    partNumber,
    totalParts,
    newStatus,
  } = req.body;
  if (
    typeof smsId != "string" &&
    typeof smsLocalId != "string" &&
    typeof partNumber != "number" &&
    typeof totalParts == "number" &&
    typeof newStatus != "string"
  ) {
    res.status(400).json({
      detail:
        "Missing argument/s smsId, smsLocalId, partNumber, totalParts, newStatus",
    });
    return;
  }

  try {
    const smsStatus = await SMStatus.create({
      statusId: uuid(),
      smsId,
      smsLocalId,
      partNumber,
      totalParts,
      newStatus,
    });

    const [currentWork] = await SMSendersWork.findOrCreate({
      where: {
        deviceKindOfId,
      },
    });

    let { smsTotal, smsPending, smsSend, smsDelivered, smsFailed } = {
      smsTotal: currentWork.getDataValue("smsTotal"),
      smsPending: currentWork.getDataValue("smsPending"),
      smsSend: currentWork.getDataValue("smsSend"),
      smsDelivered: currentWork.getDataValue("smsDelivered"),
      smsFailed: currentWork.getDataValue("smsFailed"),
    };
    smsPending = smsPending - 1;
    switch (newStatus) {
      case "SEND":
        smsSend = smsSend + 1;
        currentWork.update({
          smsPending,
          smsSend,
          score: (smsDelivered * 100) / smsTotal,
        });
        break;
      case "DELIVERED":
        smsDelivered = smsDelivered + 1;
        currentWork.update({
          smsDelivered,
          score: (smsDelivered * 100) / smsTotal,
        });
        break;
      case "FAIL":
        smsFailed = smsFailed + 1;
        currentWork.update({
          smsFailed,
          score: (smsDelivered * 100) / smsTotal,
        });
        break;
    }

    res.status(200).json(smsStatus.asUserInfo());
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/offline", async (req, res) => {
  const { deviceKindOfId } = req.body;
  if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
    res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" });
    return;
  }

  try {
    const [deviceStatus] = await SMSendersWork.update(
      { status: SendersSMStatus.OFFLINE },
      {
        where: {
          deviceKindOfId,
        },
      }
    );

    if (deviceStatus > 0) {
      res.status(200).send({});
      return;
    }

    res.status(404).json({ detail: "Invalid device" });
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/issue", async (req, res) => {
  const { deviceKindOfId } = req.body;
  if (typeof deviceKindOfId != "string" || deviceKindOfId == "") {
    res.status(400).json({ detail: "Missining and/or invalid deviceKindOfId" });
    return;
  }

  const { code, message, detail, path, isBodyEmpty } = req.body;
  if (typeof code != "number") {
    res.status(400).json({ detail: "Missining and/or invalid code" });
    return;
  }

  try {
    const issue = await Issue.create({
      apiSMSidIssue: uuid(),
      deviceKindOfId,
      code,
      message,
      detail,
      path,
      isBodyEmpty,
    });
    res.status(200).json(issue.asUserInfo());
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

export { sms, smsPath };
