import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";

class SMStatus extends Model {
    asUserInfo() {
        return {
            date: this.getDataValue("date"),
            statusId: this.getDataValue("statusId"),
        }
    }
 }

SMStatus.init({
    statusId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        validate: {
            isUUID: 4
        }
    }, smsId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, smsLocalId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
            isUUID: 4
        }
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