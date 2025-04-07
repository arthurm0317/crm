import './App.css';
import io from "socket.io-client";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";

//sessão um de conexão/teste de reconexão (isso permite que caso você tenha logado uma session ele retorne a ela automaticamente quando recarregada a pagina)
const socket = io("http://localhost:3001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
// isso seta a sessão pra se a pessoa vai entrar numa que ja existe ou criar uma nova e faz o qr code aparecer 
function App() {
  const [session, setSession] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [messages, setMessages] = useState([]); // <-- adicionado aqui
//cria a sessão/loga caso ja exista
  const createSessionForWhatsapp = async () => {
    try {
      localStorage.setItem("sessionId", session); // Salva o nome da sessão
      const res = await fetch(`http://localhost:3001/check-session/${session}`);
      const data = await res.json();
      if (data.exists) {
        console.log("🔁 Sessão já existe. Reconectando...");
        setConnectionStatus("Reconectando sessão existente...");
      } else {
        console.log("🆕 Criando nova sessão...");
        setConnectionStatus("Criando nova sessão...");
      }
//aviso de erro padrão
      socket.emit("createSession", { id: session });
    } catch (err) {
      console.error("Erro ao verificar/criar sessão:", err);
      setConnectionStatus("❌ Erro ao conectar com o backend");
    }
  };

  useEffect(() => {
    socket.emit("connected", "hello from client");
//só pra confirmar no terminal se apareceu 
    socket.on("qr", (qr) => {
      console.log("📷 QR RECEBIDO", qr);
      setQrCode(qr);
      setConnectionStatus("Escaneie o QR Code no WhatsApp");
    });

    socket.on("ready", ({ sessionId }) => {
      console.log("✅ Sessão conectada!", sessionId);
      setIsAuthenticated(true);
      setConnectionStatus("Sessão conectada com sucesso!");
    });

    socket.on("messageSent", ({ to }) => {
      setConnectionStatus(`✅ Mensagem enviada para ${to}`);
    });

    socket.on("messageFailed", ({ to, error }) => {
      setConnectionStatus(`❌ Falha ao enviar mensagem para ${to}: ${error}`);
    });
    
    socket.on("message", ({ from, body }) => {
    setMessages((prev) => [...prev, { from, body }]);
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
        console.log("🔄 Reenviando createSession após reconexão");
        socket.emit("createSession", { id: savedSession });
      }
    });
    
//sessão socket 
    return () => {
      socket.off("qr");
      socket.off("ready");
      socket.off("messageSent");
      socket.off("messageFailed");
      socket.off("message");
    };
  }, []);
//front da tela 1
  return (
    <div className="App">
      <h1>📞 WhatsApp Web JS</h1>
      {!isAuthenticated ? (
        <>
          <h2>Escaneie o QR Code</h2>
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
        //front da tela 2
        <div>
          <button 
           style={{ marginBottom: 10, backgroundColor: "#f44336", color: "#fff", padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer" }}
           onClick={() => {
  setIsAuthenticated(false);
  setQrCode("");
  setSession("");
  setMessages([]);
  localStorage.removeItem("sessionId");
  setConnectionStatus("Você saiu da sessão");
}}>
  🔁 Voltar e escolher outra sessão
</button>

          <h2>✅ Sessão conectada: {session}</h2> 
          {connectionStatus && <p>{connectionStatus}</p>}
          <ChatComponent session={session} socket={socket} messages={messages} />
        </div>
        
      )}
    </div>
  );
}

export default App;
