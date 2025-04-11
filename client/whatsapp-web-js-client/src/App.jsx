import './App.css';
import io from "socket.io-client";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";
import SidebarSessions from "./sidebar";
import SidebarNav from "./sidebar";

const socket = io("http://localhost:3001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [session, setSession] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [messages, setMessages] = useState({});
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentView, setCurrentView] = useState("connections");

  const createSessionForWhatsapp = async () => {
    try {
      localStorage.setItem("sessionId", session);
      const res = await fetch(`http://localhost:3001/check-session/${session}`);
      const data = await res.json();
      if (data.exists) {
        setConnectionStatus("Reconectando sessão existente...");
      } else {
        setConnectionStatus("Criando nova sessão...");
      }

      socket.emit("createSession", { id: session });
    } catch (err) {
      console.error("Erro ao verificar/criar sessão:", err);
      setConnectionStatus("❌ Erro ao conectar com o backend");
    }
  };

  const fetchMessagesFromDB = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3001/chat/${chatId}/messages?schema=public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => ({
          ...prev,
          [chatId]: data.messages.map(msg => ({
            from: msg.from,
            body: msg.body,
            timestamp: new Date(msg.created_at).getTime(),
          }))
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar mensagens do banco:", err);
    }
  };

  useEffect(() => {
    socket.on("qr", (qr) => {
      setQrCode(qr);
      setConnectionStatus("Escaneie o QR Code no WhatsApp");
    });

    socket.on("ready", ({ sessionId }) => {
      setIsAuthenticated(true);
      setConnectionStatus("Sessão conectada com sucesso!");
    });

    socket.on("messageSent", ({ to, message }) => {
      const text = typeof message === "string" ? message : message?.body || "";
      setMessages((prev) => ({
        ...prev,
        [to]: [...(prev[to] || []), { from: session, body: text, timestamp: Date.now() }],
      }));
    });

    socket.on("messageFailed", ({ to, error }) => {
      setConnectionStatus(`❌ Falha ao enviar mensagem para ${to}: ${error}`);
    });

    socket.on("message", (data) => {
      console.log("Mensagem recebida no front:", data);
      const { from, body, timestamp, chatId } = data;
    
      setMessages((prev) => {
        const existingMessages = prev[chatId] || [];
        const isDuplicate = existingMessages.some((msg) => msg.body === body && msg.timestamp === timestamp);
        if (isDuplicate) return prev;
    
        return {
          ...prev,
          [chatId]: [...existingMessages, { from, body, timestamp }],
        };
      });
    
      setContacts((prev) => {
        const exists = prev.find((c) => c.from === from);
        if (!exists) return [...prev, { from, chatId }];
        return prev;
      });
    });

    const savedSession = localStorage.getItem("sessionId");
    if (savedSession) {
      setSession(savedSession);
      socket.emit("createSession", { id: savedSession });
      setConnectionStatus("Reconectando sessão...");
    }

    socket.on("connect", () => {
      const savedSession = localStorage.getItem("sessionId");
      if (savedSession) {
        socket.emit("createSession", { id: savedSession });
      }
    });

    return () => {
      socket.off("qr");
      socket.off("ready");
      socket.off("messageSent");
      socket.off("messageFailed");
      socket.off("message");
    };
  }, []);

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <SidebarNav currentView={currentView} setCurrentView={setCurrentView} />

      <div style={{ flex: 1, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>📞 WhatsApp CRM</h1>
          <div>
            <strong>Usuário:</strong> admin
          </div>
        </div>

        {currentView === "connections" && (
          <div>
            <h2>Conectar nova sessão</h2>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="Nome da sessão"
            />
            <button onClick={createSessionForWhatsapp}>
              Criar ou Reconectar Sessão
            </button>
            {connectionStatus && <p>{connectionStatus}</p>}
            {qrCode && (
              <div style={{ marginTop: 20 }}>
                <QRCode value={qrCode} />
              </div>
            )}
            {isAuthenticated && (
              <SidebarSessions
                currentSession={session}
                onSelect={(sessId) => {
                  setSession(sessId);
                  setConnectionStatus(`Sessão alterada para: ${sessId}`);
                  localStorage.setItem("sessionId", sessId);
                  socket.emit("createSession", { id: sessId });
                }}
              />
            )}
          </div>
        )}

        {currentView === "chats" && isAuthenticated && (
          <div className="app-container">
            <div className="contacts-list">
              {contacts.map((contactObj) => (
                <div
                  key={contactObj.from}
                  className={`contact-item ${selectedContact?.from === contactObj.from ? "active" : ""}`}
                  onClick={() => {
                    setSelectedContact(contactObj);
                    fetchMessagesFromDB(contactObj.chatId);
                  }}
                >
                  {contactObj.from}
                </div>
              ))}
            </div>

            <div className="chat-area">
              {selectedContact ? (
                <ChatComponent
                  session={session}
                  socket={socket}
                  messages={messages[selectedContact.chatId] || []}
                  selectedContact={selectedContact.from}
                />
              ) : (
                <p>👈 Selecione um contato para conversar</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
