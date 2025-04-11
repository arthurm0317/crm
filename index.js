const express = require('express');
const userRoutes = require('./routes/UserRoutes');
const companyRoutes = require('./routes/CompanyRoutes');
const queueRoutes = require('./routes/QueueRoutes');
const connRoutes = require('./routes/ConnectionRoutes');

const app = express();

app.use(express.json());
app.use('/api', userRoutes);
app.use('/company', companyRoutes)
app.use('/queue', queueRoutes)
app.use('/connection', connRoutes)

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});