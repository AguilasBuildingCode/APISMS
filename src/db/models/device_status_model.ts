import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../sequelize";

class DevicesStatus extends Model { }

DevicesStatus.init({
    apiSMSidDevice: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    }, status: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "devices_statu"
})

DevicesStatus.sync()

export default DevicesStatus