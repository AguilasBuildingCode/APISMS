import AESEncrypt from "./aes_encrypt";
import PPKEncrypt from "./ppk_encrypt";

export default class Encrypt {
  static encrypt<T extends string | number | bigint | boolean | object>(
    toEncrypt: T
  ): string {
    const ppkEncryptData = PPKEncrypt.encrypt<T>(toEncrypt);
    return AESEncrypt.encrypt(ppkEncryptData);
  }

  static decrypt<T extends string | number | bigint | boolean | object>(
    toDecrypt: string
  ): T {
    const aesDecryptData = AESEncrypt.decrypt<string>(toDecrypt);
    return PPKEncrypt.decrypt<T>(aesDecryptData);
  }

  static decryptT<T>(
    toDecrypt: string,
    comprobator: (obj: unknown) => obj is T
  ): T {
    const aesDecryptData = AESEncrypt.decrypt<string>(toDecrypt);
    return PPKEncrypt.decryptT(aesDecryptData, comprobator);
  }
}
