const { startCampaingRedis, getCampaings, getCampaingById } = require("../services/CampaingService")

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
const getCampaingsController = async (req, res)=>{
  const schema = req.params
  try{
    const result = await getCampaings(schema.schema)
    res.status(201).json(result);
  }catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({
      erro: 'Não foi possível buscar as campanhas',
    });
  }
}

const getCampaingByIdController = async(req, res)=>{
  const{campaing_id, schema} = req.params
  try{
    const result = await getCampaingById(campaing_id, schema.schema)
    res.status(200).json(result);
  }catch(error){
    console.error(error)
  }
}
module.exports = {
  startCampaingController,
  getCampaingsController,
  getCampaingByIdController
}