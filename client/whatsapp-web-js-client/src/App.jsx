import './App.css';
import io from "socket.io-client";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";

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

    socket.on("message", ({ from, body, timestamp }) => {
      setMessages((prev) => {
        const existingMessages = prev[from] || [];
        const isDuplicate = existingMessages.some((msg) => msg.body === body && msg.timestamp === timestamp);
        if (isDuplicate) return prev;

        return {
          ...prev,
          [from]: [...existingMessages, { from, body, timestamp }],
        };
      });

      setContacts((prev) => {
        if (!prev.includes(from)) return [...prev, from];
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
    <div className="App">
      <h1>📞 WhatsApp Web JS</h1>

      {!isAuthenticated ? (
        <>
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
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setQrCode("");
              setSession("");
              setMessages({});
              setSelectedContact(null);
              setContacts([]);
              localStorage.removeItem("sessionId");
              setConnectionStatus("Você saiu da sessão");
            }}
          >
            🔁 Voltar e escolher outra sessão
          </button>

          <h2>✅ Sessão conectada: {session}</h2>
          {connectionStatus && <p>{connectionStatus}</p>}

          <div className="app-container">
            <div className="contacts-list">
              {contacts.map((contact) => (
                <div
                  key={contact}
                  className={`contact-item ${selectedContact === contact ? "active" : ""}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  {contact}
                </div>
              ))}
            </div>

            <div className="chat-area">
              {selectedContact ? (
                <ChatComponent
                  session={session}
                  socket={socket}
                  messages={messages[selectedContact] || []}
                  selectedContact={selectedContact}
                />
              ) : (
                <p>👈 Selecione um contato para conversar</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;