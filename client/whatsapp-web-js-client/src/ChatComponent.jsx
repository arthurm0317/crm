import React, { useState, useEffect, useRef } from 'react';
import './ChatComponent.css';

function ChatComponent({ session, socket, messages, selectedContact }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!message.trim()) return;

    const fullNumber = selectedContact.includes('@c.us')
      ? selectedContact
      : `${selectedContact}@c.us`;

    socket.emit("sendMessage", {
      sessionId: session,
      to: fullNumber,
      message: message,
    });

    setMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-component">
      <div className="chat-header">
        <h3>💬 Conversa com: {selectedContact}</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isSentByMe = msg.from !== selectedContact;
          return (
            <div
              key={index}
              className={`message-bubble ${isSentByMe ? "sent" : "received"}`}
            >
              {msg.body || "[mensagem vazia]"}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Digite sua mensagem"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default ChatComponent;
