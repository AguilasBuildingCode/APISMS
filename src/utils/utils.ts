import path from "path";
import fs from "fs";

export default class Utils {
  static imgsPathBuilder(imgName: string, ...filePath: string[]): string {
    const dir = path.join(__dirname, "..", "imgs", ...filePath);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, imgName);
  }

  static calcSMSParts({ length }: string): number {
    if (length >= 160 && length <= 306) {
      return Math.ceil(length / 160);
    }

    return Math.ceil(length / 153);
  }

  static isEmail(email: string): boolean {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
  }
}
