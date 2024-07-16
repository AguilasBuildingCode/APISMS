import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";

class Connection extends Model { }

Connection.init({
    token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    }, agentId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }, expireAt: {
        type: DataTypes.NUMBER,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "connection"
})

Connection.sync()

export default Connection