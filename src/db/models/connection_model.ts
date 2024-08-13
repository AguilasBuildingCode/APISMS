import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Users from "./users_model";
import Devices from "./devices_model";

class Connection extends Model {
  asUserInfo() {
    return {
      token: this.getDataValue("token"),
      tokenLifeTime: this.getDataValue("tokenLifeTime"),
      tokenExpireAt: this.getDataValue("tokenExpireAt"),
      refreshToken: this.getDataValue("refreshToken"),
      refreshTokenExtraLifeTime: this.getDataValue("refreshTokenExtraLifeTime"),
      refreshTokenExpireAt: this.getDataValue("refreshTokenExpireAt"),
      createdAt: this.getDataValue("createdAt"),
    };
  }
  asConnInfo() {
    return {
      tokenLifeTime: this.getDataValue("tokenLifeTime"),
      tokenExpireAt: this.getDataValue("tokenExpireAt"),
      refreshTokenExtraLifeTime: this.getDataValue("refreshTokenExtraLifeTime"),
      refreshTokenExpireAt: this.getDataValue("refreshTokenExpireAt"),
      createdAt: this.getDataValue("createdAt"),
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
    tokenLifeTime: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    tokenExpireAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    refreshTokenExtraLifeTime: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    refreshTokenExpireAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
