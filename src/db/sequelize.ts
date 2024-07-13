import { Sequelize } from "sequelize";

const smsSequelize = new Sequelize({
    dialect: "sqlite",
    storage: 'dist/db/API_SMS.sqlite',
});

try {
    smsSequelize.authenticate()
} catch (e) {
    console.error(e)
}

export { smsSequelize }