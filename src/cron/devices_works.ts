import cron from "node-cron"

const assignmentSMSPendingCron = cron.schedule('*/1 * * * *', async () => {

}, {
    scheduled: true,
})

export default assignmentSMSPendingCron