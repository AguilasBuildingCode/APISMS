import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";
import { SendersSMStatus } from "../enums/senders_sms_status";

class SendersSMSWork extends Model {}

SendersSMSWork.init(
  {
    deviceKindOfId: {
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
    status: {
      type: DataTypes.ENUM(SendersSMStatus.ONLINE, SendersSMStatus.OFFLINE),
      defaultValue: SendersSMStatus.OFFLINE,
      allowNull: false,
    },
    smsTotal: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      allowNull: false,
    },
    smsPending: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      allowNull: false,
    },
    smsSend: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      allowNull: false,
    },
    smsDelivered: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      allowNull: false,
    },
    smsFailed: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      allowNull: false,
    },
    score: {
      type: DataTypes.FLOAT({ decimals: 2 }),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "senders_sms_work",
  }
);

SendersSMSWork.sync();

export default SendersSMSWork;
