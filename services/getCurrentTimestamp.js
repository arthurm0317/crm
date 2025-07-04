const getCurrentTimestamp = () => {
    return new Date().getTime(); 
};

const parseLocalDateTime = (dateTimeString) => {
  // Verifica se o timezone atual é UTC (offset 0)
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  
  if (timezoneOffset === 0) {
    // Se está em UTC, converte para timezone local (-3 para Brasil)
    const utcDate = new Date(dateTimeString);
    return utcDate.getTime() - (3 * 60 * 60 * 1000); // -3 horas
  } else {
    // Se já está no timezone local, usa direto
    return new Date(dateTimeString).getTime();
  }
};
  
module.exports = { getCurrentTimestamp, parseLocalDateTime };