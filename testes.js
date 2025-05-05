const { createCampaing, startCampaing } = require("./services/CampaingService");
const { getInformationFromExcel, processExcelFile } = require("./services/ExcelReader");
const { createMessageForBlast } = require("./services/MessageBlast");

getInformationFromExcel(processExcelFile(), '4acfe063-d640-47aa-81d6-1970615ccb96', 'effective_gain')