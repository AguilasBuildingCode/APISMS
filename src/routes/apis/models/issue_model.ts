import { DataTypes, Model } from "sequelize";
import { smsSequelize } from "../../../db/sequelize";

class Issue extends Model { }

Issue.init({
    apiSMSidIssue: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    }, apiSMSidDevice: {
        type: DataTypes.UUID,
        allowNull: false,
    }, code: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }, message: {
        type: DataTypes.STRING,
    }, detail: {
        type: DataTypes.STRING,
    }, path: {
        type: DataTypes.STRING,
    }, isBodyEmpty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: smsSequelize,
    modelName: "issue"
})

Issue.sync()

export default Issue