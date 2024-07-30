import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import SMS from "./sms_model";

class SMStatus extends Model {
  asUserInfo() {
    return {
      id: this.getDataValue("id"),
      date: this.getDataValue("date"),
    };
  }
}

SMStatus.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      validate: {
        isUUID: 4,
      },
    },
    smsId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    smsLocalId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    partNumber: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    totalParts: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "sms_status",
  }
);

(async () => {
  await SMStatus.sync();
  SMStatus.belongsTo(SMS, {
    targetKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "smsId",
  });
})();

export default SMStatus;
