import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Users from "./users_model";
import Devices from "./devices_model";

class Connection extends Model {
  asUserConnInfo() {
    return {
      tokenLifeTime: this.getDataValue("tokenLifeTime"),
      tokenExpireAt: this.getDataValue("tokenExpireAt"),
      refreshTokenExtraLifeTime: this.getDataValue("refreshTokenExtraLifeTime"),
      refreshTokenExpireAt: this.getDataValue("refreshTokenExpireAt"),
      createdAt: this.getDataValue("createdAt"),
    };
  }
  asConnInfo() {
    return {
      id: this.getDataValue("id"),
      tokenLifeTime: this.getDataValue("tokenLifeTime"),
      tokenExpireAt: this.getDataValue("tokenExpireAt"),
      refreshTokenExtraLifeTime: this.getDataValue("refreshTokenExtraLifeTime"),
      refreshTokenExpireAt: this.getDataValue("refreshTokenExpireAt"),
      publicKey: this.getDataValue("publicKey"),
      createdAt: this.getDataValue("createdAt"),
    };
  }
}

Connection.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      validate: {
        isUUID: 4,
      },
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    tokenLifeTime: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    tokenExpireAt: {
      type: DataTypes.BIGINT,
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
    publicKey: {
      type: DataTypes.STRING,
      allowNull: false,
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
