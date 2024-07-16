import cron from "node-cron"
import SMS from "../models/sms_model"
import SendersSMSWork from "../models/senders_sms_works_model"
import SMSenderStatus from "../models/sms_sender_status_model"
import { Op } from "sequelize"
import io from ".."

const assignmentSMSPendingCron = cron.schedule('*/1 * * * *', async () => {
    try {
        const smsPendings = await SMS.findAll({
            where: {
                deviceKindOfId: null
            }
        })

        console.log(JSON.stringify({ smsPendings }))

        if (smsPendings.length <= 0) {
            return
        }

        smsPendings.forEach(async (sms) => {
            const availableSenders = await SMSenderStatus.findAll({
                attributes: ["deviceKindOfId"],
                where: {
                    status: "ONLINE"
                }
            })

            if (availableSenders.length <= 0) {
                // ToDo Notify
                return
            }

            const senderWork = await SendersSMSWork.findOne({
                attributes: ["deviceKindOfId", "smsPending"],
                where: {
                    [Op.or]: [{ deviceKindOfId: availableSenders.map(availableSender => availableSender.getDataValue("deviceKindOfId")) }]
                },
                order: [
                    ["smsPending", "ASC"],
                    ["smsFailed", "ASC"],
                    ["smsDelivered", "DESC"]
                ]
            })

            if (!senderWork) {
                return
            }

            await senderWork.update({
                smsPending: Number(senderWork.getDataValue("smsPending")) + 1
            })
            const deviceKindOfId = senderWork.getDataValue("deviceKindOfId")
            if (io.emit(`${deviceKindOfId}-sms-to-send`, sms)) {
                sms.update({
                    deviceKindOfId,
                })
            }

        })
    } catch (e) {
        console.error(e)
    }
}, {
    scheduled: true,
})

export default assignmentSMSPendingCron