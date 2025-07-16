const { scheduleCampaingBlast, getCampaings, getCampaingById, createCampaing, startCampaing, deleteCampaing } = require("../services/CampaingService");
const { createMessageForBlast, getAllBlastMessages, deleteAllBlastMessages } = require("../services/MessageBlast");

const startCampaingController = async (req, res) => {
  const { campaing_id } = req.body;
  const schema = req.body.schema;
  try {
    const result = await startCampaing(campaing_id, null, schema);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Não foi possível iniciar a campanha',
    });
  }
};

const getCampaingsController = async (req, res) => {
  const schema = req.params;
  try {
    const result = await getCampaings(schema.schema);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({
      erro: 'Não foi possível buscar as campanhas',
    });
  }
};

const getCampaingByIdController = async (req, res) => {
  const { campaing_id, schema } = req.params;
  try {
    const result = await getCampaingById(campaing_id, schema);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
  }
};

const createCampaingController = async (req, res) => {
  const {campaing_id, name, sector, kanban_stage, connection_id, start_date, schema, mensagem, intervalo } = req.body;
  if (!schema) {
    return res.status(400).json({ erro: 'Schema não informado!' });
  }
  try {
    let campaing;

    if(campaing_id){
      campaing = await createCampaing(campaing_id, name, sector, kanban_stage, connection_id, start_date, schema, intervalo);
    } else {
      campaing = await createCampaing(null, name, sector, kanban_stage, connection_id, start_date, schema, intervalo);
    }

    // Deletar todas as mensagens existentes da campanha antes de salvar as novas
    await deleteAllBlastMessages(campaing.id, schema);

    if (mensagem && Array.isArray(mensagem)) {
      for (const [index, item] of mensagem.entries()) {
        const texto = typeof item === 'object' ? item.text : item;
        const imagem = typeof item === 'object' ? item.image : null;
        
        await createMessageForBlast(null, texto, sector, campaing.id, schema, imagem);
      }
    }else if (mensagem) {
      const texto = typeof mensagem === 'object' ? mensagem.text : mensagem;
      const imagem = typeof mensagem === 'object' ? mensagem.image : null;
      await createMessageForBlast(null, texto, sector, campaing.id, schema, imagem);
    }

    return res.status(201).json(campaing);
    
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({
      erro: 'Não foi possível criar a campanha',
    });
  }
};


const getAllBlastMessagesController = async(req, res)=>{
  try {
    const {campaing_id, schema} = req.params
    const result = await getAllBlastMessages(campaing_id, schema)
    res.status(200).json({
      result
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Erro ao trazer mensagens do disparo'
    })
  }
}

const deleteCampaingController = async(req, res)=>{
  try {
    const {campaing_id, schema} = req.params
    const result = await deleteCampaing(campaing_id, schema)
    res.status(200).json({
      success: true,
      message: 'Campanha deletada com sucesso',
      result
    })
  } catch (error) {
    console.error('Erro ao deletar campanha:', error)
    res.status(500).json({
      error: 'Erro ao deletar campanha'
    })
  }
}

module.exports = {
  startCampaingController,
  getCampaingsController,
  getCampaingByIdController,
  createCampaingController,
  getAllBlastMessagesController,
  deleteCampaingController
};