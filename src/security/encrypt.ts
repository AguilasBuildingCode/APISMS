import crypto from "crypto";
import Config from "../config/config";

const config = Config.getInstance();
export default class Encrypt {
  static encrypt<T extends string | number | bigint | boolean | object>(toEncrypt: T): string {
    var publicKey = config.getCert();
    var buffer = Buffer.from(JSON.stringify(toEncrypt));
    var encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  }

  static decrypt<T extends string | number | bigint | boolean | object>(
    toDecrypt: string
  ): T {
    var buffer = Buffer.from(toDecrypt, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: config.getKey(),
        passphrase: config.getJWTSecret(),
      },
      buffer
    );
    return JSON.parse(decrypted.toString("utf8"));
  }

  static decryptT<T>(
    toDecrypt: string,
    comprobator: (obj: unknown) => obj is T
  ): T {
    var buffer = Buffer.from(toDecrypt, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: config.getKey(),
        passphrase: config.getJWTSecret(),
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
