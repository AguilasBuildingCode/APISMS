import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";
import { v4 as uuid } from "uuid"
import Encrypt from "../security/encrypt";

class Users extends Model {
    getAgentId() {
        return this.getDataValue("userId")
    }
}

Users.init({
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, businessName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min: 3,
        }
    }, userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }, password: {
        type: DataTypes.STRING,
        allowNull: false,
    }, type: {
        type: DataTypes.STRING,
        allowNull: false
    }, attemptsLogin: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    }, locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "user"
})

Users.sync().finally(async () => {
    try {
        await Users.findOrCreate({
            where: { userId: process.env.ROOT_USER_ID },
            defaults: {
                userId: process.env.ROOT_USER_ID,
                businessName: process.env.BUSSINES_NAME,
                userName: process.env.ROOT_USER_NAME,
                password: await Encrypt.hash(process.env.ROOT_USER_PASSWORD ?? uuid()),
                type: process.env.ROOT_USER_TYPE,
            },
        })
    } catch (e) {
        console.error(e)
    }
})

export default Users