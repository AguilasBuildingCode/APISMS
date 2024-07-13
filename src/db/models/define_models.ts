import { DataTypes } from "sequelize";
import { smsSequelize } from "../sequelize";

smsSequelize.define('sms', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
    }, number: {
        type: DataTypes.STRING,
        allowNull: false,
    }, message: {
        type: DataTypes.STRING,
        allowNull: false,
    }, date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
})

smsSequelize.define('smsStatus', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    localId: {
        type: DataTypes.STRING,
        allowNull: false,
    }, part: {
        type: DataTypes.TINYINT,
        allowNull: false,
    }, parts: {
        type: DataTypes.TINYINT,
        allowNull: false,
    }, status: {
        type: DataTypes.STRING,
        allowNull: false
    }, date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
})