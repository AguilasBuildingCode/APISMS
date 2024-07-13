import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";

class SMStatus extends Model { }

SMStatus.init({
    statusId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    }, apiSMSId: {
        type: DataTypes.STRING,
        allowNull: false,
    }, smsId: {
        type: DataTypes.STRING,
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
    modelName: "smsStatus",
}
)

SMStatus.sync()

export default SMStatus