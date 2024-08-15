import { RequestHandler } from "express";
import Users from "../db/models/users_model";
import Devices from "../db/models/devices_model";

const userValidateMiddleware: RequestHandler<any> = async (req, res, next) => {
    const { id, businessName, userName, password, type, attemptsLogin, attemptsForbidden, locked } = req.body
    if (typeof id != "string" ||
        typeof businessName != "string" ||
        typeof userName != "string" ||
        typeof password != "string" ||
        typeof type != "string" ||
        typeof attemptsLogin != "number" ||
        typeof attemptsForbidden != "number" ||
        typeof locked != "boolean") {

        if (locked) {
            res
                .status(401)
                .json({ detail: "User locked" });
            return
        }

        const agent = await Users.findByPk(id) ?? await Devices.findByPk(id)
        const attemptsForbidden = Number(agent?.getDataValue("attemptsForbidden")) + 1
        agent?.update({
            attemptsForbidden: attemptsForbidden,
            locked: attemptsForbidden >= 3,
        });
        res.status(403).json({ detail: "Invali token" })
        return
    }
    next()
}

export default userValidateMiddleware