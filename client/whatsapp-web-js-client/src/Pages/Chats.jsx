import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const schema = 'crm';
  const socket = io('http://localhost:3000');

  useEffect(() => {
    axios.get(`http://localhost:3000/chat/getChats/${schema}`)
      .then(res => setChats(res.data))
      .catch(err => console.error('Erro ao carregar chats:', err));


    socket.on('newMessage', (newMessage) => {
  
      if (selectedChat && selectedChat.chat_id === newMessage.chatId) {
        setSelectedMessages(prevMessages => [...prevMessages, newMessage.text]);
      }
    });


    return () => {
      socket.off('newMessage');
    };
  }, [selectedChat]);  
  const handleChatClick = async (chat) => {
    try {
      const res = await axios.post('http://localhost:3000/chat/getMessages', {
        chatId: chat.chat_id,
        connectionId: chat.connection_id,
        schema
      });
      setSelectedChat(chat);
      setSelectedMessages(res.data.messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  return (
    <div className="d-flex flex-column h-100 w-100 ms-2">
      <div className="mb-3">
        <button className="btn btn-primary">Novo</button>
      </div>

      <div className="chat h-100 w-100 d-flex flex-row">
        <div className="col-3" style={{ overflowY: 'auto', height: '100%' }}>
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

        <div className="col-9 p-3" style={{ height: '100%' }}>
          <h5>Mensagens</h5>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {selectedMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
