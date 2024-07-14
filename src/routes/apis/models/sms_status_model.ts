import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../db/sequelize";

class SMStatus extends Model { }

SMStatus.init({
    statusId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    }, apiSMSId: {
        type: DataTypes.UUID,
        allowNull: false,
    }, smsId: {
        type: DataTypes.UUID,
        allowNull: false,
    }, apiSMSidDevice: {
        type: DataTypes.UUID,
        allowNull: false,
    }, partNumber: {
        type: DataTypes.TINYINT,
        allowNull: false,
    }, totalParts: {
        type: DataTypes.TINYINT,
        allowNull: false,
    }, newStatus: {
        type: DataTypes.STRING,
        allowNull: false
    }, date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
}, {
    sequelize: smsSequelize,
    modelName: "sms_status",
}
)

SMStatus.sync()

export default SMStatus