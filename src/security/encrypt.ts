import AESEncrypt from "./aes_encrypt";
import PPKEncrypt from "./ppk_encrypt";

export default class Encrypt {
  static encrypt<T extends string | number | bigint | boolean | object>(
    toEncrypt: T
  ): string {
    const aesEncrypt = AESEncrypt.encrypt(toEncrypt);
    return PPKEncrypt.encrypt(aesEncrypt);
  }

  static decrypt<T extends string | number | bigint | boolean | object>(
    toDecrypt: string
  ): T {
    const ppkEncrypt = PPKEncrypt.decrypt<string>(toDecrypt);
    return AESEncrypt.decrypt<T>(ppkEncrypt);
  }

  static decryptT<T>(
    toDecrypt: string,
    comprobator: (obj: unknown) => obj is T
  ): T {
    const ppkEncrypt = PPKEncrypt.decrypt<string>(toDecrypt);
    return AESEncrypt.decryptT(ppkEncrypt, comprobator);
  }
}
