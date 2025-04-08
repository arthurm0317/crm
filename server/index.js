const express = require('express');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const chatInstances = [];
const app = express();
const port = 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const sessions = {}; // Armazena todas as sessões

// Endpoint para verificar se sessão já existe
app.get("/check-session/:id", (req, res) => {
  const sessionId = req.params.id;
  const sessionPath = `./.wwebjs_auth/session-${sessionId}`;
  const exists = fs.existsSync(sessionPath);
  res.json({ exists });
});

// Rota simples de teste
app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

// WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado via socket:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });

  socket.on('createSession', ({ id }) => {
    if (sessions[id]) {
      console.log(`⚠️ Sessão ${id} já existe`);
      return;
    }

    console.log(`📲 Criando nova sessão: ${id}`);

    const client = new Client({
      puppeteer: {
        headless: false,
      },
      authStrategy: new LocalAuth({
        clientId: id,
      }),
    });

    sessions[id] = client;

    client.on("qr", (qr) => {
      console.log(`📷 QR gerado para sessão ${id}`);
      socket.emit("qr", qr);
    });

    client.on("ready", () => {
      console.log(`✅ Sessão ${id} conectada!`);
      socket.emit("ready", { sessionId: id });

      client.on("message", async (msg) => {
        console.log(`[${msg.from}]: ${msg.body}`);
        const chat = msg.getChat()
        console.log(chat)
        
        // Envia pro frontend
        socket.emit("message", {
          from: msg.from,
          body: msg.body,
          timestamp: msg.timestamp || Date.now(),
          
        });
      });
    });
    async function listarLabels() {
      const labels = await client.getLabels();
      console.log(labels);
    }
    client.on("message", async (msg) => {
      console.log(`📨 [${id}] Mensagem recebida:`, msg.body);
    
      const chat = await msg.getChat(); // ⬅️ AQUI
      console.log("💬 Chat:", chat);
    
      const labels = await client.getLabels(); // ⬅️ AQUI
      console.log("🏷️ Labels:", labels);
    
      socket.emit("message", {
        sessionId: id,
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp || Date.now(),
      });
    });

    client.initialize();
  });

  socket.on("sendMessage", async ({ to, message, sessionId }) => {
    const client = sessions[sessionId];
    if (!client) {
      
      socket.emit("messageFailed", {
        to,
        error: "Sessão não encontrada",
      });
      return;
    }
    
    try {
      await client.sendMessage(to, message);
      console.log(`📤 Mensagem enviada de ${sessionId} para ${to}: ${message}`);

      const text = typeof message === "string" ? message : message.body || "";

      socket.emit("messageSent", {
        to,
        message: {
          body: text,
          from: sessionId,
          timestamp: Date.now(),
        }
      });
    } catch (err) {
      console.error(`❌ Erro ao enviar mensagem: ${err.message}`);
      socket.emit("messageFailed", {
        to,
        error: err.message,
      });
    }
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
