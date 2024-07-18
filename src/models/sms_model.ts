import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";

class SMS extends Model {
  asUserInfo() {
    return {
      apiSMSId: this.getDataValue("apiSMSId"),
    };
  }
}

SMS.init(
  {
    apiSMSId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    deviceKindOfId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    countryCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        min: 2,
        max: 5,
      },
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "sms",
  }
);

SMS.sync();

export default SMS;
