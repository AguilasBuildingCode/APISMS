import { RequestHandler } from "express";
import JWT from "../security/jwt";
import Connection from "../db/models/connection_model";
import { Op } from "sequelize";

const jwt = new JWT();
const authValidateMiddleware: RequestHandler<any> = async (req, res, next) => {
  const token = req.header("Authorization");
  if (typeof token != "string" || !token.startsWith("Bearer")) {
    res.status(400).json({ detail: "Missing and/or invalid token" });
    return;
  }

  const splitedToke = token.split(" ");
  if (splitedToke.length != 2) {
    res.status(400).json({ detail: "Missing and/or invalid token" });
    return;
  }

  try {
    const currentConn = await Connection.findOne({
      where: {
        [Op.or]: [{ token: splitedToke[1] }, { refreshToken: splitedToke[1] }],
        deleted: false,
      },
    });

    if (!currentConn) {
      res.status(401).json({ detail: "Invalid token" });
      return;
    }

    const agent = jwt.verify(splitedToke[1]);
    let parentAgent: any = null;
    if (jwt.isRefreshToken(agent)) {
      parentAgent = jwt.decode(agent.parentToken);
    }

    req.body = {
      agentId:
        (agent as any).id ||
        parentAgent.id,
      ...agent,
      ...parentAgent,
      token: splitedToke[1],
      currentConn: currentConn.asConnInfo(),
      ...req.body,
    };
    next();
  } catch (e: any) {
    console.error(e);
    res.status(401).json({ detail: e.message });
  }
};

export default authValidateMiddleware;
