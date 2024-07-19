import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import { DeviceTypes } from "../../enums/devices_types";
import Connection from "./connection_model";
import SMS from "./sms_model";

class Devices extends Model {
  getAgentId() {
    return this.getDataValue("id");
  }
  asUserInfo() {
    return {
      id: this.getDataValue("id"),
      deviceKindOfId: this.getDataValue("deviceKindOfId"),
    };
  }
}

Devices.init(
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
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    kind: {
      type: DataTypes.ENUM(DeviceTypes.SMS_SENDER),
      defaultValue: DeviceTypes.SMS_SENDER,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 8,
      },
    },
    attemptsLogin: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "devices",
  }
);

(async () => {
  await Devices.sync();
  Devices.hasMany(Connection, {
    sourceKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "agentId",
  });
  Devices.hasMany(SMS, {
    sourceKey: "deviceKindOfId",
    keyType: DataTypes.UUID,
    foreignKey: "deviceKindOfId",
  });
  // console.log(
  //   JSON.stringify(
  //     await Devices.findAll({
  //       include: {
  //         model: SMS,
  //       },
  //     })
  //   )
  // );
})();

export default Devices;
