import express, { RequestHandler } from "express";
import JWT from "../../security/jwt";
import Connection from "../../db/models/connection_model";
import authValidateMiddleware from "../../middlewares/auth_validate_middleware";
import Users from "../../db/models/users_model";
import Devices from "../../db/models/devices_model";
import PsswdEncrypt from "../../security/passwd_encrypt";

const jwt = new JWT();
const auth = express.Router();
const authPath = "/auth";

const authMiddleware: RequestHandler<any> = async (req, res, next) => {
  const { agentId, userName, password } = req.body;
  if (
    typeof agentId == "string" &&
    typeof userName == "string" &&
    typeof password == "string"
  ) {
    try {
      const currentConn = await Connection.findOne({
        attributes: ["token", "expireAt"],
        where: {
          agentId,
          deleted: false,
        },
        order: [["expireAt", "DESC"]],
      });

      if (currentConn && jwt.verify(currentConn.getDataValue("token"))) {
        const expireAt = currentConn.getDataValue("expireAt");
        res
          .status(401)
          .json({ detail: "Your last connection already is valid", expireAt });
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
  const { agentId, userName, password, parentToken, token, currentConn } =
    req.body;
  try {
    try {
      if (parentToken && currentConn && jwt.verify(parentToken)) {
        const expireAt = currentConn.getDataValue("expireAt");
        res
          .status(401)
          .json({ detail: "Your last connection already is valid", expireAt });
        return;
      }

      if (!parentToken && token && currentConn && jwt.verify(token)) {
        const expireAt = currentConn.getDataValue("expireAt");
        res
          .status(401)
          .json({ detail: "Your last connection already is valid", expireAt });
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
      userName != agent.getDataValue("userName") ||
      (!(await PsswdEncrypt.compare(
        password,
        agent.getDataValue("password")
      )) &&
        password != agent.getDataValue("password"))
    ) {
      const attemptsLogin = Number(agent.getDataValue("attemptsLogin")) + 1;
      agent.update({
        attemptsLogin,
        locked: attemptsLogin >= 3,
      });
      res
        .status(401)
        .json({ detail: "Invalid userId and/or userName and/or password" });
      return;
    }

    const conn = await jwt.sing(agent);
    res.status(200).json(conn.asUserInfo());
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ detail: e.message });
  }
});

auth.post("/valid", async (_, res) => {
  res.status(200).send({});
});

auth.post("/logout", async (req, res) => {
  const { token } = req.body;

  try {
    const [logout] = await Connection.update(
      {
        deleted: true,
      },
      {
        where: {
          token,
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
