const { startCampaingRedis } = require("./services/CampaingService");



const func = async()=>{
    await startCampaingRedis('eada70d1-5b4e-45e7-b117-06e10532e1fc', 100000, 'effective_gain')
}

func()