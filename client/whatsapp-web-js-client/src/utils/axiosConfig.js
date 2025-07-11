import axios from 'axios';

// Configurar axios para sempre enviar cookies
axios.defaults.withCredentials = true;

export default axios; 