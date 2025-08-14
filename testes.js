const { getExpensesById } = require("./services/ExpensesService");
const { createChatCompletion } = require("./services/OpenAi");
const { getGptResponse, createReport } = require("./services/ReportService");


const test = async () => {
    await getExpensesById('b4b5f2ac-e74e-44ab-9f97-ea8ebc238cdd', 'effective_gain')
}

test()