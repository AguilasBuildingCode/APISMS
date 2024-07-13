import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../db/sequelize";

class Connection extends Model { }

Connection.init({
    token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    }, userId: {
        type: DataTypes.UUID,
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