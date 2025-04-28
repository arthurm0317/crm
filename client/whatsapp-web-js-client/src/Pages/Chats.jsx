import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function ChatPage({ theme }) {
  const [chats, setChats] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const selectedChatRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));

  const schema = userData.schema;
  const socket = useRef(io('http://localhost:3000')).current;

  console.log(schema);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket conectado:', socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  },[]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/chat/getChats/${schema}`)
      .then((res) => setChats(res.data))
      .catch((err) => console.error('Erro ao carregar chats:', err));

    socket.on('message', (newMessage) => {
      console.log('nova mensagem recebida:', newMessage);
      if (selectedChatRef.current && selectedChatRef.current.chat_id === newMessage.chatId) {
        setSelectedMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off('message');
    };
  }, [schema, socket]);

  const handleChatClick = async (chat) => {
    try {
      const res = await axios.post('http://localhost:3000/chat/getMessages', {
        chatId: chat.chat_id,
        schema,
      });
      setSelectedChat(chat);
      setSelectedMessages(res.data.messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  return (
    <div className={`d-flex flex-column h-100 w-100 ms-2`}>
      <div className="mb-3">
        <button className={`btn btn-1-${theme}`}>Novo</button>
      </div>
      <div className={`chat chat-${theme} h-100 w-100 d-flex flex-row`}>
        <div className={`col-3 chat-list-${theme}`} style={{ overflowY: 'auto', height: '100%' }}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
            >
              <strong>{chat.contact || chat.number || 'Sem Nome'}</strong>
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
                style={{
                  backgroundColor: msg.fromMe ? '#dcf8c6' : '#f1f0f0', 
                  textAlign: msg.fromMe ? 'right' : 'left', 
                  padding: '10px',
                  borderRadius: '10px',
                  margin: '5px 0',
                  maxWidth: '70%',
                  alignSelf: msg.fromMe ? 'flex-end' : 'flex-start', 
                }}
              >
                {msg.body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;