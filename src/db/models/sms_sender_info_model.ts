import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Devices from "./devices_model";

class SMSenderInfo extends Model {}

SMSenderInfo.init(
  {
    deviceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sdk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appVersionCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    board: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fingerPrint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appVersionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carrierIdFromSimMccMnc: {
      type: DataTypes.STRING,
    },
    simCarrierId: {
      type: DataTypes.STRING,
    },
    simCarrierIdName: {
      type: DataTypes.STRING,
    },
    simState: {
      type: DataTypes.STRING,
    },
    simOperator: {
      type: DataTypes.STRING,
    },
    simCountryIso: {
      type: DataTypes.STRING,
    },
    simOperatorName: {
      type: DataTypes.STRING(5),
      validate: {
        min: 2,
        max: 5,
      },
    },
    simSpecificCarrierIdName: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "sms_sender_info",
  }
);

(async () => {
  await SMSenderInfo.sync();
  SMSenderInfo.belongsTo(Devices);
})();

export default SMSenderInfo;
