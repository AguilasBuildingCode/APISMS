import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import JWT from "../security/jwt";

const jwt = new JWT();
const authValidateSocketMiddleware: (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => void = (socket, next) => {
  const token = socket.handshake.auth["Authorization"];
  if (typeof token != "string" || !token.startsWith("Bearer")) {
    next(new Error("Bad request"));
    return;
  }

  const splitedToke = token.split(" ");
  if (splitedToke.length != 2) {
    next(new Error("Bad request"));
    return;
  }

  try {
    const agent = jwt.verify(splitedToke[1]);
    if (jwt.isDevice(agent)) {
      next();
      return;
    }
  } catch {}
  next(new Error("Unauthorized"));
};

export default authValidateSocketMiddleware;
