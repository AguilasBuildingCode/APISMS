import express, { RequestHandler } from "express";
import JWT from "../../security/jwt";
import Connection from "../../db/models/connection_model";
import authValidateMiddleware from "../../middlewares/auth_validate_middleware";
import Users from "../../db/models/users_model";
import Devices from "../../db/models/devices_model";
import PsswdEncrypt from "../../security/passwd_encrypt";
import { Op } from "sequelize";

const jwt = new JWT();
const auth = express.Router();
const authPath = "/auth";

const authMiddleware: RequestHandler<any> = async (req, res, next) => {
  const { agentId, userName, password, publicKey } = req.body;

  if (
    typeof agentId == "string" &&
    typeof userName == "string" &&
    typeof password == "string" &&
    typeof publicKey == "string"
  ) {
    try {
      const currentConn = await Connection.findOne({
        where: {
          agentId,
          tokenExpireAt: {
            [Op.gte]: Date.now(),
          },
          deleted: false,
        },
        order: [["tokenExpireAt", "ASC"]],
      });

      if (currentConn) {
        res.status(401).json({
          detail: "Your last connection already is valid",
          ...currentConn.asUserConnInfo(),
        });
        return;
      }
      next();
    } catch (e: any) {
      next();
    }
    return;
  }

  authValidateMiddleware(req, res, next);
};

auth.post("/login", async (req, res) => {
  const { agentId, userName, password, parentToken, token, currentConn, publicKey } =
    req.body;

  try {
    try {
      if (parentToken && currentConn && await jwt.verify(parentToken)) {
        res.status(401).json({
          detail: "Your last connection already is valid",
          ...currentConn,
        });
        return;
      }

      if (!parentToken && token && currentConn && await jwt.verify(token)) {
        res.status(401).json({
          detail: "Your last connection already is valid",
          ...currentConn,
        });
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const agent =
      (await Users.findByPk(agentId)) ?? (await Devices.findByPk(agentId));
    if (!agent) {
      res
        .status(401)
        .json({ detail: "Invalid agentId and/or userName and/or password" });
      return;
    }

    if (Boolean(agent.getDataValue("locked"))) {
      res
        .status(401)
        .json({ detail: "User locked by exced attempt login limit" });
      return;
    }

    if (
      userName == agent.getDataValue("userName") &&
      (await PsswdEncrypt.compare(password, agent.getDataValue("password")))
    ) {
      const { token, tokenLifeTime, tokenExpireAt, refreshToken, refreshTokenExtraLifeTime, refreshTokenExpireAt, createdAt } = await jwt.sing(agent, publicKey, password);
      res.status(200).json({ token, tokenLifeTime, tokenExpireAt, refreshToken, refreshTokenExtraLifeTime, refreshTokenExpireAt, createdAt });
      return;
    }

    const attemptsLogin = Number(agent.getDataValue("attemptsLogin")) + 1;
    agent.update({
      attemptsLogin,
      locked: attemptsLogin >= 3,
    });
    res
      .status(401)
      .json({ detail: "Invalid agentId and/or userName and/or password" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ detail: e.message });
  }
});

auth.post("/valid", async (req, res) => {
  const { parentToken, currentConn } = req.body;
  if (parentToken && parentToken != "") {
    try {
      await jwt.verify(parentToken);
      res.status(200).send({ ...currentConn });
    } catch (e) {
      console.error(e);
      res.status(401).json({ detail: "Invalid token" });
    }
    return;
  }
  res.status(200).send({ ...currentConn });
});

auth.post("/logout", async (req, res) => {
  const { connId } = req.body;

  try {
    const [logout] = await Connection.update(
      {
        deleted: true,
      },
      {
        where: {
          id: connId
        },
      }
    );

    if (logout > 0) {
      res.status(200).send({});
      return;
    }
    res.status(404).json({ detail: "Invalid token" });
  } catch (e: any) {
    res.status(500).json({ detail: e.message });
  }
});

export { auth, authPath, authMiddleware };
