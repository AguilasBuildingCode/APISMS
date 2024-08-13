import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import { v4 as uuid } from "uuid";
import PsswdEncrypt from "../../security/passwd_encrypt";
// import Encrypt from "../../security/encrypt";
import Business from "./business_model";
import Connection from "./connection_model";
import SMS from "./sms_model";
import Devices from "./devices_model";

class Users extends Model {
  getAgentId() {
    return this.getDataValue("id");
  }
  asTokenData(realPassword: string) {
    return {
      id: this.getDataValue("id"),
      businessName: this.getDataValue("businessName"),
      userName: this.getDataValue("userName"),
      password: realPassword,
      type: this.getDataValue("type"),
      attemptsLogin: this.getDataValue("attemptsLogin"),
      locked: this.getDataValue("locked"),
    };
  }
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 3,
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "user",
  }
);

(async () => {
  await Users.sync();
  Users.hasMany(SMS);
  Users.hasMany(Devices);
  Users.belongsTo(Business);
  Users.hasMany(Connection, {
    sourceKey: "id",
    keyType: DataTypes.UUID,
    foreignKey: "agentId",
  });
  try {
    await Users.findOrCreate({
      where: { id: process.env.ROOT_USER_ID },
      defaults: {
        id: process.env.ROOT_USER_ID,
        businessName: process.env.BUSSINES_NAME ?? "N/A",
        userName: process.env.ROOT_USER_NAME,
        password: await PsswdEncrypt.hash(
          process.env.ROOT_USER_PASSWORD ?? uuid()
        ),
        type: process.env.ROOT_USER_TYPE,
      },
    });
  } catch (e) {
    console.error(e);
  }
})();

export default Users;
