const { getInformationFromExcel, processExcelFile } = require("./services/ExcelReader");


const teste = async () => {
    const planilha = await processExcelFile('025de7b9-619d-49ce-a6df-25e79f6043ca', 'relacionamento','ilha_do_gov')
}

teste()