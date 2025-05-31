import { useState } from 'react';
import axios from 'axios';

function Chatgpt() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState(''); // Novo estado para o prompt

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await axios.post('http://localhost:3002/chatgpt', { message: input, prompt });
      setMessages([...newMessages, { sender: 'gpt', text: res.data.response }]);
    } catch {
      setMessages([...newMessages, { sender: 'gpt', text: 'Erro ao responder.' }]);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>ChatGPT</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Prompt do robô (ex: Você é um assistente...)"
          style={{ width: '100%', marginBottom: 10 }}
        />
      </div>
      <div style={{ height: 300, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <b>{msg.sender === 'user' ? 'Você' : 'Bot'}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
          style={{ width: '80%' }}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default Chatgpt;