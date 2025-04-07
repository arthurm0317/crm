import React, { useState } from 'react';

function ChatComponent({ session, socket, messages }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!phoneNumber || !message) return;

    const fullNumber = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    socket.emit("sendMessage", {
      sessionId: session,
      to: fullNumber,
      message: message,
    });

    setMessage('');
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Enviar mensagem</h3>
      <input
        type="text"
        placeholder="Número com DDD (ex: 5599999999999)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      
      {/* Mostrar mensagens recebidas */}
      <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
        <h4>Mensagens recebidas:</h4>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from}:</strong> {msg.body}
          </div>
        ))}
      </div>

      <textarea
        placeholder="Digite sua mensagem"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}

export default ChatComponent;
