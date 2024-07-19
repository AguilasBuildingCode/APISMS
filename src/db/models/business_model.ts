import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";
import Encrypt from "../../security/encrypt";

class Business extends Model {}

Business.init(
  {
    businessName: {
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

Business.sync().finally(async () => {
  try {
    await Business.findOrCreate({
      where: { businessName: process.env.BUSSINES_NAME },
      defaults: {
        businessName: Encrypt.encrypt(process.env.BUSSINES_NAME ?? "N/A"),
        legalRep: Encrypt.encrypt(process.env.LEGAL_REP ?? "N/A"),
      },
    });
  } catch (e) {
    console.error(e);
  }
});

export default Business;
