import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../../db/sequelize";

class SMS extends Model { }

SMS.init({
    apiSMSId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    countryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        validate: {
            min: 2,
            max: 5,
        }
    }, number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isNumeric: true,
        }
    }, message: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min: 1,
        }
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