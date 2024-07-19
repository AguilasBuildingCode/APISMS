import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";

class Issues extends Model {
  asUserInfo() {
    return {
      id: this.getDataValue("id"),
    };
  }
}

Issues.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
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
    code: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
    },
    detail: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    isBodyEmpty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "issue",
  }
);

Issues.sync();

export default Issues;
