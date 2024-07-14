import { RequestHandler } from "express"
import JWT from "../../jwt/jwt"

const jwt = new JWT()
const authMiddleware: RequestHandler<any> = (req, res, next) => {
    const token = req.header("Authorization")
    if (typeof token != "string" || !token.startsWith("Bearer")) {
        res.status(400).json({ detail: "Missing and/or invalid token" })
        return
    }

    const splitedToke = token.split(" ")
    if (splitedToke.length != 2) {
        res.status(400).json({ detail: "Missing and/or invalid token" })
        return
    }

    try {
        const tokenRes = jwt.verify(splitedToke[1])
        req.body = { ...tokenRes, ...req.body }
        next()
    } catch (e: any) {
        console.error(e)
        res.status(401).json({ detail: e.message })
    }
}

export default authMiddleware