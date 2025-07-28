const { createChatCompletion } = require("./services/OpenAi");
const { getGptResponse, createReport } = require("./services/ReportService");


const test = async () => {
    const gpt_response = await getGptResponse('3ff86a1b-1f9e-4dcf-b987-7b7f5619d3bf', 'effective_gain')
    await createReport('3ff86a1b-1f9e-4dcf-b987-7b7f5619d3bf', gpt_response, 'effective_gain');
}

test()