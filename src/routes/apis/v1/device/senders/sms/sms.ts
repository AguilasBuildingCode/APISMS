import express from "express";
import { v4 as uuid } from "uuid";
import SMSenderInfo from "../../../../../../db/models/sms_sender_info_model";
import Issues from "../../../../../../db/models/issue_model";
import SMSendersWork from "../../../../../../db/models/sms_senders_works_model";
import { Op } from "sequelize";
import SMStatus from "../../../../../../db/models/sms_status_model";
import { SendersSMStatus } from "../../../../../../enums/senders_sms_status";
import Devices from "../../../../../../db/models/devices_model";
import SMS from "../../../../../../db/models/sms_model";
import Encrypt from "../../../../../../security/encrypt";

const sms = express.Router();
const smsPath = "/sms";

sms.put("/register", async (req, res) => {
  const {
    agentId,
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

  try {
    const smsSender = await SMSenderInfo.findOne({
      attributes: ["deviceId"],
      where: {
        deviceId: agentId,
        model,
        id,
      },
      include: {
        attributes: [],
        model: Devices,
        where: {
          userId,
        },
      },
    });

    if (smsSender) {
      smsSender.update({
        sdk: Encrypt.encrypt(sdk),
        userName: Encrypt.encrypt(userName),
        type: Encrypt.encrypt(type),
        appVersionCode: Encrypt.encrypt(appVersionCode),
        appVersionName: Encrypt.encrypt(appVersionName),
        carrierIdFromSimMccMnc: Encrypt.encrypt(carrierIdFromSimMccMnc),
        simCarrierId: Encrypt.encrypt(simCarrierId),
        simCarrierIdName: Encrypt.encrypt(simCarrierIdName),
        simState: Encrypt.encrypt(simState),
        simOperator: Encrypt.encrypt(simOperator),
        simCountryIso,
        simOperatorName,
        simSpecificCarrierIdName: Encrypt.encrypt(simSpecificCarrierIdName),
      });
      res.status(200).json({});
      return;
    }

    await Promise.all([
      await SMSenderInfo.create({
        deviceId: agentId,
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
        simOperatorName,
        simSpecificCarrierIdName: Encrypt.encrypt(simSpecificCarrierIdName),
      }),
      await SMSendersWork.create({ deviceId: agentId, userId }),
    ]);
    res.status(201).json({});
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/online", async (req, res) => {
  const { agentId } = req.body;

  try {
    const [deviceStatus] = await SMSendersWork.update(
      { status: SendersSMStatus.ONLINE },
      {
        where: {
          deviceId: agentId,
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
  const { agentId, smsIds } = req.body;
  if (!(smsIds instanceof Array) || smsIds.length == 0) {
    res.status(400).json({ detail: "Missing o invalid apiSMSIdsPending" });
    return;
  }

  try {
    const sms = await SMS.findAll({
      attributes: ["id", "countryCode", "number", "message"],
      include: [
        {
          attributes: [],
          model: SMStatus,
          required: false,
        },
      ],
      where: {
        id: {
          [Op.in]: smsIds,
        },
        "$sms_statuses.smsId$": null,
        deviceId: agentId,
      },
      subQuery: false,
    });

    res.status(200).json(
      sms.map((_sms) => {
        return {
          smsId: _sms.getDataValue("id"),
          countryCode: _sms.getDataValue("countryCode"),
          number: Encrypt.decrypt(_sms.getDataValue("number")),
          message: Encrypt.decrypt(_sms.getDataValue("message")),
        };
      })
    );
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/update", async (req, res) => {
  const { agentId, smsId, smsLocalId, partNumber, totalParts, status } =
    req.body;
  if (
    typeof smsId != "string" &&
    typeof smsLocalId != "string" &&
    typeof partNumber != "number" &&
    typeof totalParts == "number" &&
    typeof status != "string"
  ) {
    res.status(400).json({
      detail:
        "Missing or invalid argument/s smsId, smsLocalId, partNumber, totalParts, status",
    });
    return;
  }

  try {
    const smsStatus = await SMStatus.create({
      id: uuid(),
      smsId,
      smsLocalId,
      partNumber,
      totalParts,
      status,
    });

    const [currentWork] = await SMSendersWork.findOrCreate({
      where: {
        deviceId: agentId,
      },
    });

    let { smsTotal, smsPending, smsSend, smsDelivered, smsFailed } = {
      smsTotal: currentWork.getDataValue("smsTotal"),
      smsPending: currentWork.getDataValue("smsPending"),
      smsSend: currentWork.getDataValue("smsSend"),
      smsDelivered: currentWork.getDataValue("smsDelivered"),
      smsFailed: currentWork.getDataValue("smsFailed"),
    };
    smsPending = smsPending > 0 ? smsPending - 1 : smsPending;
    switch (status) {
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
          smsPending,
          smsFailed,
          score: (smsDelivered * 100) / smsTotal,
        });
        break;
    }

    res.status(201).json(smsStatus.asUserInfo());
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

sms.post("/offline", async (req, res) => {
  const { agentId } = req.body;

  try {
    const [deviceStatus] = await SMSendersWork.update(
      { status: SendersSMStatus.OFFLINE },
      {
        where: {
          deviceId: agentId,
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
  const { agentId } = req.body;

  const { code, message, detail, path, isBodyEmpty } = req.body;
  if (typeof code != "number") {
    res.status(400).json({ detail: "Missing and/or invalid code" });
    return;
  }

  try {
    const issue = await Issues.create({
      id: uuid(),
      deviceId: agentId,
      code,
      message,
      detail,
      path,
      isBodyEmpty,
    });
    res.status(201).json(issue.asUserInfo());
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

export { sms, smsPath };
