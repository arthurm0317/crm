const { createAPIKey } = require('./config/ApiKey')


const test = async () => {
    const apiKey = await createAPIKey()
    console.log(apiKey)
}

test()