import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../db/sequelize";

class DeviceInfo extends Model { }

DeviceInfo.init({
    apiSMSidDevice: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    }, userId: {
        type: DataTypes.UUID,
        allowNull: false,
    }, id: {
        type: DataTypes.STRING,
        allowNull: false
    }, model: {
        type: DataTypes.STRING,
        allowNull: false
    }, sdk: {
        type: DataTypes.TINYINT,
        allowNull: false
    }, manufacturer: {
        type: DataTypes.STRING,
        allowNull: false
    }, brand: {
        type: DataTypes.STRING,
        allowNull: false
    }, userName: {
        type: DataTypes.STRING,
        allowNull: false
    }, type: {
        type: DataTypes.STRING,
        allowNull: false
    }, appVersionCode: {
        type: DataTypes.STRING,
        allowNull: false
    }, board: {
        type: DataTypes.STRING,
        allowNull: false
    }, host: {
        type: DataTypes.STRING,
        allowNull: false
    }, fingerPrint: {
        type: DataTypes.STRING,
        allowNull: false
    }, appVersionName: {
        type: DataTypes.STRING,
        allowNull: false
    }, carrierIdFromSimMccMnc: {
        type: DataTypes.STRING,
    }, simCarrierId: {
        type: DataTypes.STRING,
    }, simCarrierIdName: {
        type: DataTypes.STRING,
    }, simState: {
        type: DataTypes.TINYINT,
    }, simOperator: {
        type: DataTypes.STRING,
    }, simCountryIso: {
        type: DataTypes.STRING,
    }, simOperatorName: {
        type: DataTypes.STRING,
    }, simSpecificCarrierIdName: {
        type: DataTypes.STRING,
    },
}, {
    sequelize: smsSequelize,
    modelName: "devices_info"
})

DeviceInfo.sync()

export default DeviceInfo