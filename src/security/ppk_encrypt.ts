import crypto from "crypto";
import Config from "../config/config";
import CompressData from "./compress";

const config = Config.getInstance();
export default class PPKEncrypt {
  static encrypt<T extends string | number | bigint | boolean | object>(
    toEncrypt: T
  ): string {
    var buffer = Buffer.from(JSON.stringify(toEncrypt));
    var encrypted = crypto.publicEncrypt(
      {
        key: config.getPPKPublic(),
        passphrase: config.getPPKSecret(),
      },
      buffer
    );
    return CompressData.zip(encrypted.toString("base64"));
  }

  static decrypt<T extends string | number | bigint | boolean | object>(
    toDecrypt: string
  ): T {
    var buffer = Buffer.from(CompressData.unzip(toDecrypt), "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: config.getPPKPrivate(),
        passphrase: config.getPPKSecret(),
      },
      buffer
    );
    return JSON.parse(decrypted.toString("utf8"));
  }

  static decryptT<T>(
    toDecrypt: string,
    comprobator: (obj: unknown) => obj is T
  ): T {
    var buffer = Buffer.from(CompressData.unzip(toDecrypt), "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: config.getKey(),
        passphrase: config.getPPKSecret(),
      },
      buffer
    );
    const data = JSON.parse(decrypted.toString("utf8"));
    if (comprobator(data)) {
      return data;
    }
    throw Error("Type dismatch.");
  }
}
