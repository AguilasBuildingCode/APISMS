import zlib from "zlib";

const encoding: BufferEncoding = "base64";
export default class CompressData {
  static zip(data: string) {
    return Buffer.from(zlib.deflateSync(data)).toString(encoding);
  }

  static unzip(data: string) {
    return zlib.inflateSync(Buffer.from(data, encoding)).toString();
  }
}
