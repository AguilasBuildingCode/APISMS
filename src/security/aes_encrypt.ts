import crypto from "crypto";
import Config from "../config/config";
import CompressData from "./compress";

const config = Config.getInstance();
const encoding: BufferEncoding = "hex";
export default class AESEncrypt {
  static splitEncryptedText(encryptedText: string) {
    return {
      encryptedDataString: encryptedText.slice(56, -32),
      ivString: encryptedText.slice(0, 24),
      assocDataString: encryptedText.slice(24, 56),
      tagString: encryptedText.slice(-32),
    };
  }

  static encrypt<T extends string | number | bigint | boolean | object>(
    toEncrypt: T
  ): string {
    const iv = crypto.randomBytes(12);
    const assocData = crypto.randomBytes(16);
    const plaintext = JSON.stringify(toEncrypt);
    const cipher = crypto.createCipheriv(
      "chacha20-poly1305",
      config.getAESSecret(),
      iv,
      {
        authTagLength: 16,
      }
    );

    cipher.setAAD(assocData, {
      plaintextLength: Buffer.byteLength(plaintext),
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf-8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const data = `${iv.toString(encoding)}${assocData.toString(
      encoding
    )}${encrypted.toString(encoding)}${tag.toString(encoding)}`;

    return CompressData.zip(data);
  }

  static decrypt<T extends string | number | bigint | boolean | object>(
    toDecrypt: string
  ): T {
    const { encryptedDataString, ivString, assocDataString, tagString } =
      AESEncrypt.splitEncryptedText(CompressData.unzip(toDecrypt));

    const iv = Buffer.from(ivString, encoding);
    const encryptedText = Buffer.from(encryptedDataString, encoding);
    const tag = Buffer.from(tagString, encoding);

    const decipher = crypto.createDecipheriv(
      "chacha20-poly1305",
      config.getAESSecret(),
      iv,
      { authTagLength: 16 }
    );
    decipher.setAAD(Buffer.from(assocDataString, encoding), {
      plaintextLength: encryptedDataString.length,
    });
    decipher.setAuthTag(Buffer.from(tag));

    const decrypted = decipher.update(encryptedText);
    return JSON.parse(Buffer.concat([decrypted, decipher.final()]).toString());
  }

  static decryptT<T>(
    toDecrypt: string,
    comprobator: (obj: unknown) => obj is T
  ): T {
    const { encryptedDataString, ivString, assocDataString, tagString } =
      AESEncrypt.splitEncryptedText(CompressData.unzip(toDecrypt));

    const iv = Buffer.from(ivString, encoding);
    const encryptedText = Buffer.from(encryptedDataString, encoding);
    const tag = Buffer.from(tagString, encoding);

    const decipher = crypto.createDecipheriv(
      "chacha20-poly1305",
      config.getAESSecret(),
      iv,
      { authTagLength: 16 }
    );
    decipher.setAAD(Buffer.from(assocDataString, encoding), {
      plaintextLength: encryptedDataString.length,
    });
    decipher.setAuthTag(Buffer.from(tag));

    const decrypted = decipher.update(encryptedText);
    const data = JSON.parse(
      Buffer.concat([decrypted, decipher.final()]).toString()
    );
    if (comprobator(data)) {
      return data;
    }
    throw Error("Type dismatch.");
  }
}
