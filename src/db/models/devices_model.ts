import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Connection from "./connection_model";
import SMS from "./sms_model";
import Users from "./users_model";
import SMSendersWork from "./sms_senders_works_model";
import SMSenderInfo from "./sms_sender_info_model";
import Issues from "./issue_model";

class Devices extends Model {
  getAgentId() {
    return this.getDataValue("id");
  }
  asUserInfo() {
    return {
      id: this.getDataValue("id"),
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
  Devices.belongsTo(Users);
  Devices.hasMany(Connection, {
    sourceKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "agentId",
  });
  Devices.hasMany(SMS);
  Devices.hasOne(SMSendersWork);
  Devices.hasOne(SMSenderInfo);
  Devices.hasOne(Issues);
})();

export default Devices;
