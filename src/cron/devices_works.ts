import cron from "node-cron"
import SMS from "../routes/apis/models/sms_model"
import SendersSMSWork from "../routes/apis/models/senders_sms_works_model"
import DevicesStatus from "../routes/apis/models/device_status_model"
import { Op } from "sequelize"
import io from ".."

const assignmentSMSPendingCron = cron.schedule('*/1 * * * *', async () => {
    const smsPendings = await SMS.findAll({
        where: {
            apiSMSidDevice: null
        }
    })

    console.log(JSON.stringify({ smsPendings }))

    if (smsPendings.length <= 0) {
        return
    }

    smsPendings.forEach(async (sms) => {
        const availableSenders = await DevicesStatus.findAll({
            attributes: ["apiSMSidDevice"],
            where: {
                status: "ONLINE"
            }
        })

        console.log(JSON.stringify({ availableSenders }))

        if (availableSenders.length <= 0) {
            // ToDo Notify
            return
        }

        const senderWork = await SendersSMSWork.findOne({
            attributes: ["apiSMSidDevice"],
            where: {
                [Op.or]: [{ apiSMSidDevice: availableSenders.map(availableSender => availableSender.getDataValue("apiSMSidDevice")) }]
            },
            order: [
                ["smsPending", "ASC"]
            ]
        })

        console.log(JSON.stringify({ senderWork }))

        if (!senderWork) {
            return
        }

        const apiSMSidDevice = senderWork.getDataValue("apiSMSidDevice")
        if (io.emit(`${apiSMSidDevice}-sms-to-send`, sms)) {
            sms.update({
                apiSMSidDevice,
            })
        }
    })
}, {
    scheduled: true,
})

export default assignmentSMSPendingCron