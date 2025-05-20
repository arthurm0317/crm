const { startCampaingRedis } = require("../services/CampaingService")

const startCampaingController = async (req, res) => {
    const {campaing_id, timer} = req.body
    const schema = req.body.schema
    try{
        const result = await startCampaingRedis(campaing_id, timer, schema)
    res.status(201).json(result);
    } catch (error) {
    console.log(error);
    res.status(500).json({
      erro: 'Não foi possível iniciar a campanha',
    });
  }
}
module.exports = {startCampaingController}