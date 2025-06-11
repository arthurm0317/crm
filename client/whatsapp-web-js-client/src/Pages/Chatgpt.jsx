import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function Chatgpt() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await axios.post('http://localhost:3002/chatgpt', {
        message: input,
        prompt,
      });
      setMessages([...newMessages, { sender: 'gpt', text: res.data.response }]);
    } catch {
      setMessages([...newMessages, { sender: 'gpt', text: 'Erro ao responder.' }]);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h2 style={styles.header}>ChatGPT</h2>

        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Prompt do robô (ex: Você é um assistente...)"
          style={styles.promptInput}
        />

        <div style={styles.messagesContainer} ref={chatRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
              }}
            >
              <strong>{msg.sender === 'user' ? 'Você' : 'Bot'}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div style={styles.inputContainer}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f7f7f8',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBox: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 600,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: 20,
  },
  header: {
    marginBottom: 10,
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
  },
  promptInput: {
    padding: 10,
    marginBottom: 15,
    border: '1px solid #ddd',
    borderRadius: 8,
    width: '100%',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    border: '1px solid #eee',
  },
  message: {
    padding: '10px 14px',
    borderRadius: 16,
    maxWidth: '80%',
    fontSize: 14,
    lineHeight: '1.4em',
  },
  inputContainer: {
    display: 'flex',
    marginTop: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#10a37f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 20px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Chatgpt;
