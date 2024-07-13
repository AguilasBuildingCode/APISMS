import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";

class SMS extends Model { }

SMS.init({
    apiSMSId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    countryCode: {
        type: DataTypes.STRING(2),
        allowNull: false,
    }, number: {
        type: DataTypes.STRING(10),
        allowNull: false,
    }, message: {
        type: DataTypes.STRING,
        allowNull: false,
    }, date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
}, {
    sequelize: smsSequelize,
    modelName: "sms",
}
)

SMS.sync()

export default SMS