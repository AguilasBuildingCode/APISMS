import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";

class SendersSMSWork extends Model { }

SendersSMSWork.init({
    deviceKindOfId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, smsPending: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        allowNull: false,
    }, smsSend: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        allowNull: false,
    }, smsDelivered: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        allowNull: false,
    }, smsFailed: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "senders_sms_work"
})

SendersSMSWork.sync()

export default SendersSMSWork