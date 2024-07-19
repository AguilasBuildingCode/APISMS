import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Encrypt from "../../security/encrypt";
import Users from "./users_model";

class Business extends Model {}

Business.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        min: 3,
      },
    },
    legalRep: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 3,
      },
    },
  },
  {
    sequelize: smsSequelize,
    modelName: "business",
  }
);

(async () => {
  await Business.sync();
  Business.hasOne(Users, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  try {
    await Business.findOrCreate({
      where: { name: process.env.BUSSINES_NAME },
      defaults: {
        name: process.env.BUSSINES_NAME,
        legalRep: Encrypt.encrypt(process.env.LEGAL_REP ?? "N/A"),
      },
    });
  } catch (e) {
    console.error(e);
  }
})();

export default Business;
