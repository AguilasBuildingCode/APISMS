import { RequestHandler } from "express";
import JWT, { AgentToken } from "../security/jwt";
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
    const agentId = await jwt.verify(splitedToke[1]);
    let parentAgent: AgentToken | undefined = undefined;
    if (jwt.isRefreshToken(agentId)) {
      parentAgent = await jwt.decode(agentId.parentToken);
    }

    const currentConn = await Connection.findOne({
      where: {
        id: !jwt.isRefreshToken(agentId) ? (agentId as any).connId : parentAgent && !jwt.isRefreshToken(parentAgent) ? (parentAgent as any).connId : '',
        refreshTokenExpireAt: {
          [Op.gte]: Date.now(),
        },
        deleted: false,
      },
      order: [["tokenExpireAt", "ASC"]],
    });

    if (!currentConn) {
      res.status(401).json({ detail: "Invalid token" });
      return;
    }

    req.body = {
      agentId:
        (agentId as any).id ||
        (parentAgent as any).id,
      ...agentId,
      ...parentAgent,
      token: splitedToke[1],
      currentConn: currentConn.asUserConnInfo(),
      ...req.body,
    };

    next();
  } catch (e: any) {
    console.error("authValidateMiddleware-56", e);
    res.status(401).json({ detail: e.message });
  }
};

export default authValidateMiddleware;
