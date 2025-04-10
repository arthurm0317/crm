// backend index.js (versão aprimorada com destroy e reinicialização de sessões)
const express = require('express');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const port = 3001;
const server = http.createServer(app);
const sessions = {}; // armazena todas as instâncias
const users = [
  { username: "admin", password: "123456", role: "admin" },
  { username: "user", password: "123456", role: "user" }
];

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// verifica se sessão existe no disco
app.get("/check-session/:id", (req, res) => {
  const sessionId = req.params.id;
  const sessionPath = `./.wwebjs_auth/session-${sessionId}`;
  const exists = fs.existsSync(sessionPath);
  res.json({ exists });
});
// rota para listar sessões ativas
app.get("/active-sessions", (req, res) => {
  const activeSessions = Object.keys(sessions);
  res.json({ sessions: activeSessions });
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado via socket:', socket.id);

  socket.on('disconnect', () => {
    console.log('desconectado');
  });

  socket.on('destroySession', async ({ id }) => {
    if (sessions[id]) {
      try {
        await sessions[id].destroy();
        delete sessions[id];
        socket.emit('sessionDestroyed', { sessionId: id });
        console.log(`🧨 Sessão ${id} destruída com sucesso.`);
      } catch (err) {
        console.error(`Erro ao destruir sessão ${id}:`, err);
      }
    }
  });

  socket.on('createSession', async ({ id }) => {
    if (sessions[id]) {
      console.log(`⚠️ Sessão ${id} já existe. Reinicializando...`);
      try {
        await sessions[id].destroy();
        delete sessions[id];
      } catch (err) {
        console.error(`Erro ao destruir sessão ${id}:`, err);
      }
    }

    console.log(`📲 Criando nova sessão: ${id}`);

    const client = new Client({
      puppeteer: { headless: false },
      authStrategy: new LocalAuth({ clientId: id }),
    });

    sessions[id] = client;

    client.on("qr", (qr) => {
      console.log(`📷 QR gerado para sessão ${id}`);
      socket.emit("qr", qr);
    });

    client.on("ready", () => {
      console.log(`✅ Sessão ${id} conectada!`);
      socket.emit("ready", { sessionId: id });
    });

    client.on("auth_failure", (msg) => {
      console.error(`Falha de autenticação ${id}:`, msg);
      socket.emit("auth_failure", { sessionId: id, message: msg });
    });

    client.on("disconnected", async (reason) => {
      console.warn(`❌ Sessão ${id} desconectada:`, reason);
      try { await client.destroy(); } catch {}
      delete sessions[id];
      socket.emit("disconnected", { sessionId: id });
    });

    client.on("message", async (msg) => {
      console.log(`📨 [${id}] Mensagem: ${msg.body}`);
      socket.emit("message", {
        sessionId: id,
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp || Date.now(),
      });
    });

    try {
      await client.initialize();
    } catch (err) {
      console.error(`Erro ao inicializar sessão ${id}:`, err);
    }
  });

  socket.on("sendMessage", async ({ to, message, sessionId }) => {
    const client = sessions[sessionId];
    if (!client) {
      socket.emit("messageFailed", { to, error: "Sessão não encontrada" });
      return;
    }

    try {
      await client.sendMessage(to, message);
      console.log(`📤 Mensagem enviada de ${sessionId} para ${to}: ${message}`);
      socket.emit("messageSent", {
        to,
        message: {
          body: message,
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "usuario ou senha incorretos" });
  }
  return res.json({
    success: true,
    user: { username: user.username, role: user.role }
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
