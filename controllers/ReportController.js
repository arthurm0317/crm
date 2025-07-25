const { getReports } = require("../services/ReportService")

const getReportsController = async (req, res) => {
    const {schema} = req.params
    try {
        const result = await getReports(schema)
        res.status(200).json({
            success: true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            success:false
        })
    }
}

module.exports = {
    getReportsController
}