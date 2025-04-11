// backend index.js 
const express = require('express');
const fs = require('fs');
const { Client, LocalAuth} = require('whatsapp-web.js');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { Chat } = require('../entities/Chat');
const { v4: uuidv4 } = require('uuid');
const { createChat, getChat, getChatService } = require('../services/ChatService');
const { Message } = require('../entities/Message');
const { searchUser } = require('../services/UserService');
const Connections = require('../entities/Connection');
const { createConnection } = require('../services/ConnectionService');
const { saveMessage } = require('../services/MessageService');
const pool = require('../db/queries');

const chatInstances = [];
const app = express();
const port = 3001;
const server = http.createServer(app);

const sessions = {}; 

const users = [
  { email: "arthur", password: "password", role: "admin" },
  { email: "joao", password: "123123", role: "user" }
];

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
//const sessionIds = getSessionsByCompany(username ou outro);
//for (const id of sessionIds) {
//  if (!sessions[id]) {
//    createSession(id);
//  }
//}
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
  const conn = activeSessions.values
  console.log("sessão", conn)
  res.json({ sessions: activeSessions });
});
// Iniciar conversa manualmente
app.post("/start-chat", async (req, res) => {
  const { sessionId, to, message } = req.body;

  const client = sessions[sessionId];
  if (!client) {
    return res.status(400).json({ success: false, message: "Sessão não encontrada" });
  }

  try {
    const sentMessage = await client.sendMessage(to, message);
    const chat = await sentMessage.getChat();

    const conn = new Connections(uuidv4(), "manual", to, null);
    const chatDb = new Chat(
      uuidv4(),
      chat.id._serialized,
      conn.getId(),
      null,
      false,
      chat.name || to,
      null,
      "waiting",
      new Date(),
      null
    );

    const mensagem = new Message(uuidv4(), message, true, chatDb.getId());
    createChat(chatDb, 'public', mensagem);

    return res.status(200).json({ success: true, message: "Mensagem enviada e chat iniciado." });

  } catch (err) {
    console.error("Erro ao iniciar chat:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
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

    client.on("ready", async() => {
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
      console.log(`📨 [${id}] Mensagem recebida:`, msg.body);

      console.log("sessao:", sessions)
      console.log("sessao:", sessions[0])
      

      const chat = await msg.getChat(); // ⬅️ AQUI

      const conn = new Connections(uuidv4(), "teste2", client.info.wid.user, null)
      const connDb = await createConnection(conn, 'public')

      console.log("connection: ", connDb)
      
      const chatDB = new Chat(uuidv4(), chat.id._serialized, connDb.id, null, false, (await chat.getContact()).pushname, null, "waiting", new Date(), null)
      const mensagem = new Message(uuidv4(), msg.body, false, chatDB.getId())
      console.log("1",chatDB.id)
      const chatTest = await getChatService(chatDB, 'public')
      console.log("2",chatTest)
      const mensagemDb = await saveMessage(chatTest.id, mensagem, 'public')

      console.log(mensagemDb)
      
      const labels = await client.getLabels(); // ⬅️ AQUI
      console.log("🏷️ Labels:", labels);
    
      socket.emit("message", {
        sessionId: id,
        from: (await chat.getContact()).pushname,
        body: msg.body,
        timestamp: msg.timestamp || Date.now(),
        chatId: chatTest.id
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
    const sentMessage = await client.sendMessage(to, message);
    console.log(`📤 Mensagem enviada de ${sessionId} para ${to}: ${message}`);

    // 🔽 Buscando/Simulando o chat para armazenar no sistema
    const chat = await sentMessage.getChat();
    const chatDb = new Chat(uuidv4(), chat.id._serialized, conn.getId(), null, false, (await chat.getContact()).pushname, null, "waiting", new Date(), null)
    const mensagem = new Message(
      uuidv4(),
      message,
      true, // fromMe
      chatDb.getId()
    );

    createChat(chatDb, 'public', mensagem);

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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await searchUser(username, password);
  
    if (!user) {
      return res.status(401).json({ success: false, message: "usuario ou senha incorretos" });
    }
    return res.status(201).json({
      success: true,
      user: { username: user.user.email, role: user.user.permission }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
});
app.get("/chat/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;
  const schema = req.query.schema || 'public';

  try {
    const result = await pool.query(`
      SELECT * FROM ${schema}.messages WHERE chat_id = $1 ORDER BY created_at ASC
    `, [chatId]);

    res.status(200).json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar mensagens" });
  }
});

server.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});