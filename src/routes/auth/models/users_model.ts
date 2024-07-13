import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../db/sequelize";

class Users extends Model { }

Users.init({
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
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
        validate: {
            isEmail: true,
        }
    }, password: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
            len: [16, 64],
        }
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
        const rootUser = await Users.findOrCreate({
            where: { userId: process.env.ROOT_USER_ID },
            defaults: {
                userId: process.env.ROOT_USER_ID,
                businessName: process.env.BUSSINES_NAME,
                userName: process.env.ROOT_USER_NAME,
                password: process.env.ROOT_USER_PASSWORD,
                type: process.env.ROOT_USER_TYPE,
            },
        })
        console.log(JSON.stringify({ rootUser }))
    } catch (e) {
        console.error(e)
    }
})

export default Users