import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Users from "./users_model";
import Devices from "./devices_model";

class Connection extends Model {
  asUserInfo() {
    return {
      token: this.getDataValue("token"),
      refreshToken: this.getDataValue("refreshToken"),
      expireAt: this.getDataValue("expireAt"),
    };
  }
}

Connection.init(
  {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    expireAt: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "connection",
  }
);

(async () => {
  await Connection.sync();
  Connection.belongsTo(Users, {
    targetKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "agentId",
  });
  Connection.belongsTo(Devices, {
    targetKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "agentId",
  });
})();

export default Connection;
