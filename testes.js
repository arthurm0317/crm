const { createCampaing, startCampaing } = require("./services/CampaingService");
const { getInformationFromExcel, processExcelFile } = require("./services/ExcelReader");
const { createMessageForBlast } = require("./services/MessageBlast");

startCampaing("4d0ab8f5-2670-4794-9cac-eeb32c6c01dd", 5, "effective_gain")