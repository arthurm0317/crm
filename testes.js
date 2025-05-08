const { getBase64FromMediaMessage } = require("./requests/evolution");


async function testarAudio() {
  try {
    const teste = await getBase64FromMediaMessage('cauan', '3EB05926F1CE0D08870E74');
    console.log('Resultado:', teste);
  } catch (error) {
    console.error('Erro ao obter áudio:', error.message);
  }
}

testarAudio();