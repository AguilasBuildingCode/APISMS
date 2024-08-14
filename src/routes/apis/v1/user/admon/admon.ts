import express from "express";
import Devices from "../../../../../db/models/devices_model";
import PsswdEncrypt from "../../../../../security/passwd_encrypt";
import { v4 as uuid } from "uuid";
import QRcode from "qrcode";
import Utils from "../../../../../utils/utils";

const admon = express.Router();
const admonPath = "/admon";

admon.put("/devices", async (req, res) => {
  const { id, userName, password } = req.body;

  if (
    typeof userName != "string" ||
    typeof password != "string" ||
    password.length < 8
  ) {
    res.status(400).json({
      detail: "Missing or invalid userName and/or password",
    });
    return;
  }

  try {
    const registedDevice = await Devices.findOne({
      where: {
        userId: id,
        userName,
      },
    });

    if (registedDevice) {
      res.status(400).json({ detail: "Device already registed" });
      return;
    }

    const deviceId = uuid();
    const tmpPassword = await PsswdEncrypt.hash(password);

    const device = await Devices.create({
      id: deviceId,
      userId: id,
      userName,
      password: tmpPassword,
    });
    const qrPath = Utils.imgsPathBuilder(
      `${uuid()}.png`,
      id,
      deviceId,
      userName
    );
    await QRcode.toFile(
      qrPath,
      JSON.stringify({ ...device.asCredentials(), password }),
      {
        type: "png",
      }
    );
    res.status(201).sendFile(qrPath);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ detail: e.message });
  }
});

export { admon, admonPath };
