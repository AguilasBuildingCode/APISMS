import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Users from "./users_model";
import Devices from "./devices_model";
import SMStatus from "./sms_status_model";

class SMS extends Model {
  asUserInfo() {
    return {
      id: this.getDataValue("id"),
    };
  }
}

SMS.init(
  {
    id: {
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

(async () => {
  await SMS.sync();
  SMS.belongsTo(Users);
  SMS.belongsTo(Devices, {
    targetKey: "deviceKindOfId",
    keyType: DataTypes.UUID,
    foreignKey: "deviceKindOfId",
  });
  SMS.hasMany(SMStatus, {
    sourceKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "smsId",
  });
  console.log(
    JSON.stringify(
      await SMS.findAll({
        include: {
          model: SMStatus,
        },
      })
    )
  );
  // console.log(
  //   JSON.stringify(
  //     await SMS.findAll({
  //       include: {
  //         model: Users,
  //       },
  //     })
  //   )
  // );
})();

export default SMS;
