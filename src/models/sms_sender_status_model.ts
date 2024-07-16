import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";

class SMSenderStatus extends Model { }

SMSenderStatus.init({
    deviceKindOfId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, status: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "devices_statu"
})

SMSenderStatus.sync()

export default SMSenderStatus