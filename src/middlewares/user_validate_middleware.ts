import { RequestHandler } from "express";

const userValidateMiddleware: RequestHandler<any> = (req, res, next) => {
    const { userId, businessName, userName, password, type, attemptsLogin, locked } = req.body
    if (typeof userId != "string" ||
        typeof businessName != "string" ||
        typeof userName != "string" ||
        typeof password != "string" ||
        typeof type != "string" ||
        typeof attemptsLogin != "number" ||
        typeof locked != "boolean") {
        res.status(403).json({ detail: "Invali token" })
        return
    }
    next()
}

export default userValidateMiddleware