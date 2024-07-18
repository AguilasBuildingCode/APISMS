import crypto from "crypto";
import Config from "../config/config";

const config = Config.getInstance();
export default class Encrypt {
  static encrypt(toEncrypt: any) {
    var publicKey = config.getCert();
    var buffer = Buffer.from(JSON.stringify(toEncrypt));
    var encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  }

  static decrypt(toDecrypt: string) {
    var buffer = Buffer.from(toDecrypt, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: config.getKey(),
        passphrase: config.getJWTSecret(),
      },
      buffer
    );
    return decrypted.toString("utf8");
  }
}
