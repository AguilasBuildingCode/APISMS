import path from "path";
import fs from 'fs';

export default class Utils {
    static imgsPathBuilder(imgName: string, ...filePath: string[]): string {
        const dir = path.join(__dirname, "..", "imgs", ...filePath)
        fs.mkdirSync(dir, { recursive: true })
        return path.join(dir, imgName)
    }
}