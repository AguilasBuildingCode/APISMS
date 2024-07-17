import bcrypt from "bcrypt"

const saltRounds = 10

export default class Encrypt {
    static async hash(plainData: string): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds)
        return await bcrypt.hash(plainData, salt)
    }

    static async compare(plainData: string, hashData: string) {
        return await bcrypt.compare(plainData, hashData)
    }
}