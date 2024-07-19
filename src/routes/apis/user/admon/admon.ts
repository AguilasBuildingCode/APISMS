import express from "express";
import Devices from "../../../../db/models/devices_model";
import PsswdEncrypt from "../../../../security/passwd_encrypt";
import { v4 as uuid } from "uuid";
import QRcode from "qrcode";
import Utils from "../../../../utils/utils";

const admon = express.Router();
const admonPath = "/admon";

admon.put("/devices", async (req, res) => {
  const { id, kind, userName, password } = req.body;

  if (
    typeof kind != "string" ||
    typeof userName != "string" ||
    typeof password != "string" ||
    password.length < 8
  ) {
    res
      .status(400)
      .json({
        detail: "Missing or invalid kind and/or userName andor password",
      });
    return;
  }

  try {
    const registedDevice = await Devices.findOne({
      where: {
        userId: id,
        kind,
        userName,
      },
    });

    if (registedDevice) {
      res.status(400).json({ detail: "Device already registed" });
      return;
    }

    const deviceId = uuid();
    const deviceKindOfId = uuid();
    const tmpPassword = await PsswdEncrypt.hash(password);

    const device = await Devices.create({
      id: deviceId,
      userId: id,
      deviceKindOfId,
      kind,
      userName,
      password: tmpPassword,
    });
    const qrPath = Utils.imgsPathBuilder(
      `${uuid()}.png`,
      id,
      deviceId,
      deviceKindOfId,
      userName
    );
    await QRcode.toFile(
      qrPath,
      JSON.stringify({ ...device.asUserInfo(), userName, password }),
      { type: "png" }
    );
    res.status(200).sendFile(qrPath);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ detail: e.message });
  }
});

export { admon, admonPath };
