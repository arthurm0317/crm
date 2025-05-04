import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function ChatPage({ theme }) {
  const [chats, setChats] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData.schema;

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3000');

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
    };

    ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      console.log('Nova mensagem recebida via WS:', newMessage);
      if (selectedChatRef.current && selectedChatRef.current.chat_id === newMessage.chatId) {
        setSelectedMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/chat/getChat/${userData.id}/${schema}`)
      .then((res) => {
        setChats(res.data.messages || []);
      })
      .catch((err) => console.error('Erro ao carregar chats:', err));
  }, [schema]);

  const handleChatClick = async (chat) => {
    try {
      const res = await axios.post('http://localhost:3000/chat/getMessages', {
        chatId: chat.chat_id,
        schema,
      });
      setSelectedChat(chat);
      setSelectedMessages(res.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post('http://localhost:3000/chat/sendMessage', {
        chatId: selectedChat.chat_id,
        message: newMessage,
        schema,
        replyTo: replyMessage ? replyMessage.body : null,
      });

      setSelectedMessages((prevMessages) => [
        ...prevMessages,
        { body: newMessage, fromMe: true, replyTo: replyMessage ? replyMessage.body : null },
      ]);

      setNewMessage('');
      setReplyMessage(null);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAudioRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Erro ao acessar o microfone:', error);
      }
    } else {
      mediaRecorder.stop();
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('chatId', selectedChat.chat_id);
        formData.append('schema', schema);

        try {
          const response = await axios.post('http://localhost:3000/chat/sendAudio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const sentAudio = response.data.message;
          setSelectedMessages((prevMessages) => [...prevMessages, sentAudio]);
          setAudioChunks([]);
        } catch (error) {
          console.error('Erro ao enviar áudio:', error);
        }
      };

      setIsRecording(false);
    }
  };

  return (
    <div className={`d-flex flex-column h-100 w-100 ms-2`}>
      <div className="mb-3">
        <button className={`btn btn-1-${theme}`}>Novo</button>
      </div>
      <div className={`chat chat-${theme} h-100 w-100 d-flex flex-row`}>
        <div className={`col-3 chat-list-${theme}`} style={{ overflowY: 'auto', height: '100%' }}>
          {Array.isArray(chats) && chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
            >
              <strong>{chat.contact_name || chat.chat_id || 'Sem Nome'}</strong>
              <div
                style={{
                  color: '#666',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {Array.isArray(chat.messages) && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1]
                  : 'Sem mensagens'}
              </div>
            </div>
          ))}
        </div>

        <div className={`col-9 chat-messages-${theme}`} style={{ height: '100%' }}>
          <div style={{ whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column' }}>
            {selectedMessages.map((msg, idx) => (
              <div
                key={idx}
                onClick={() => handleReply(msg)}
                style={{
                  backgroundColor: msg.fromMe ? '#dcf8c6' : '#f1f0f0',
                  textAlign: msg.fromMe ? 'right' : 'left',
                  padding: '10px',
                  borderRadius: '10px',
                  margin: '5px 0',
                  maxWidth: '70%',
                  alignSelf: msg.fromMe ? 'flex-end' : 'flex-start',
                  cursor: 'pointer',
                }}
              >
                {msg.replyTo && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#555',
                      marginBottom: '5px',
                      borderLeft: '2px solid #ccc',
                      paddingLeft: '5px',
                    }}
                  >
                    Resposta: {msg.replyTo}
                  </div>
                )}
                {msg.audioUrl ? (
                  <audio controls style={{ width: '100%' }}>
                    <source src={`http://localhost:3000${msg.audioUrl}`} type="audio/webm" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                ) : (
                  msg.body
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input" style={{ marginTop: '10px', display: 'flex' }}>
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ width: '70%', padding: '10px', marginRight: '10px' }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                marginRight: '10px',
              }}
            >
              Enviar
            </button>
            <button
              onClick={handleAudioRecording}
              style={{
                padding: '10px 20px',
                backgroundColor: isRecording ? '#dc3545' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              {isRecording ? 'Parar' : 'Gravar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
