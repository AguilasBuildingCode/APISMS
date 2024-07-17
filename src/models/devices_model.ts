import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";
import { DeviceTypes } from "../enums/devices_types";

class Devices extends Model {
    getAgentId() {
        return this.getDataValue("deviceId")
    }
    asUserInfo() {
        return {
            deviceId: this.getDataValue("deviceId"),
            deviceKindOfId: this.getDataValue("deviceKindOfId")
        }
    }
}

Devices.init({
    deviceId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, userId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, deviceKindOfId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
            isUUID: 4
        }
    }, kind: {
        type: DataTypes.ENUM(DeviceTypes.SMS_SNEDER),
        defaultValue: DeviceTypes.SMS_SNEDER,
        allowNull: false,
    }, userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }, password: {
        type: DataTypes.STRING,
        allowNull: false,
    }, attemptsLogin: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    }, locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }
}, {
    sequelize: smsSequelize,
    modelName: "devices"
})

Devices.sync()

export default Devices