import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../db/sequelize";
import { DeviceTypes } from "../enums/devices_types";
import { v4 as uuid } from "uuid"

class Devices extends Model {
    getAgentId() {
        return this.getDataValue("deviceId")
    }
    asUserInfo() {
        return {
            deviceId: this.getDataValue("deviceId"),
            deviceKindOfId: this.getDataValue("deviceKindOfId"),
            kind: this.getDataValue("kind"),
        }
    }
}

Devices.init({
    deviceId: {
        type: DataTypes.UUID,
        defaultValue: uuid(),
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
        defaultValue: uuid(),
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
        validate: {
            isEmail: true,
        }
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