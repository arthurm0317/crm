class Evolution {
  constructor(apiKey, serverUrl) {
    this.apiKey = apiKey;
    this.serverUrl = serverUrl;
  }

  async createInstance(data) {
    const options = {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(`${this.serverUrl}/instance/create`, options);
      const result = await response.json();
      console.log('Instância criada:', result);
      return result;
    } catch (err) {
      console.error('Erro ao criar instância:', err);
    }
  }
}

module.exports = { Evolution };
