import { RequestHandler } from "express";
import Users from "../../../../../../db/models/users_model";
import Devices from "../../../../../../db/models/devices_model";

const deviceValidateMiddleWare: RequestHandler<any> = async (req, res, next) => {
    const { id, userId, userName, password, attemptsLogin, attemptsForbidden, locked } = req.body
    if (typeof id != "string" ||
        typeof userId != "string" ||
        typeof userName != "string" ||
        typeof password != "string" ||
        typeof attemptsLogin != "number" ||
        typeof attemptsForbidden != "number" ||
        typeof locked != "boolean") {

        if (locked) {
            res
                .status(401)
                .json({ detail: "Device locked" });
            return
        }

        const agent = await Users.findByPk(id) ?? await Devices.findByPk(id)
        const attemptsForbidden = Number(agent?.getDataValue("attemptsForbidden")) + 1
        agent?.update({
            attemptsForbidden: attemptsForbidden,
            locked: attemptsForbidden >= 3,
        });
        res.status(403).json({ detail: "Invalid token" })
        return
    }
    next()
}

export default deviceValidateMiddleWare