import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import JWT from "../security/jwt";

const jwt = new JWT();
const authValidateSocketMiddleware: (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => void = async (socket, next) => {
  const token =
    socket.handshake.headers["Authorization"] ??
    socket.handshake.headers["authorization"] ??
    socket.handshake.auth["Authorization"];
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
    let agent = await jwt.verify(splitedToke[1]);
    if (jwt.isRefreshToken(agent)) {
      agent = await jwt.decode(agent.parentToken);
    }
    if (jwt.isDevice(agent)) {
      next();
      return;
    }
  } catch {}
  next(new Error("Unauthorized"));
};

export default authValidateSocketMiddleware;
