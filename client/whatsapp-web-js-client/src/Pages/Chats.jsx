import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function ChatPage({ theme }) {
  const [chats, setChats] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));

  const schema = userData.schema;
  const socket = useRef(io('http://localhost:3000')).current;

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket conectado:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Erro ao conectar ao socket:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    console.log('selectedChatRef atualizado:', selectedChatRef.current);
  }, [selectedChat]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/chat/getChat/${userData.id}/${schema}`)
      .then((res) => {
        setChats(res.data.messages || []);
      })
      .catch((err) => console.error('Erro ao carregar chats:', err));
  }, [schema]);

  useEffect(() => {
    socket.on('message', (newMessage) => {
      console.log('Nova mensagem recebida no frontend:', newMessage);
      console.log('Chat selecionado (id):', selectedChatRef.current?.id);
      console.log('Chat da mensagem recebida (chatId):', newMessage.chatId);

      if (!newMessage.chatId) {
        console.error('Mensagem recebida sem chatId:', newMessage);
        return;
      }

      if (selectedChatRef.current && String(selectedChatRef.current.id) === String(newMessage.chatId)) {
        setSelectedMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          console.log('Mensagens atualizadas:', updatedMessages);
          return updatedMessages;
        });
        scrollToBottom();
      } else {
        console.log('Mensagem recebida para outro chat:', newMessage.chatId);
      }
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post('https://landing-page-teste.8rxpnw.easypanel.host/chat/getMessages', {
          chatId: selectedChat.chat_id,
          schema,
        });
        setSelectedMessages(res.data.messages);
      } catch (error) {
        console.error('Erro ao atualizar mensagens do chat selecionado:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedChat, schema]);

  const handleChatClick = async (chat) => {
    console.log('Chat selecionado', chat);
    try {
      const res = await axios.post('http://localhost:3000/chat/getMessages', {
        chatId: chat.chat_id,
        schema,
      });
      console.log('Mensagens recebidas:', res.data.messages);
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
      await axios.post('http://localhost:3000/evo/sendText', {
        instanceId: selectedChat.connection_id,
        number: selectedChat.contact_phone,
        text: newMessage,
        chatId: selectedChat.id,
        schema: schema,
      });

      setSelectedMessages((prevMessages) => [
        ...prevMessages,
        { body: newMessage, from_me: true, replyTo: replyMessage ? replyMessage.body : null },
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

  return (
    <div className={`d-flex flex-column h-100 w-100 ms-2`}>
      <div className="mb-3">
        <button className={`btn btn-1-${theme}`}>Novo</button>
      </div>
      <div className={`chat chat-${theme} h-100 w-100 d-flex flex-row`}>

        {/*  LISTA DE CONTATOS  */}
        <div className={`col-3 chat-list-${theme} bg-color-${theme}`} style={{ overflowY: 'auto', height: '100%' }}>
          {Array.isArray(chats) &&
            chats.map((chat) => (
              /*  CONTATO NA LISTA */
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
        
        {/*  MENSAGENS DO CONTATO SELECIONADO */}
        <div className={`col-9 chat-messages-${theme} d-flex flex-column`} style={{ height: '100%' }}>
          <div 
          id="corpoTexto"
          className= "px-3 pt-3 h-100 d-flex justify-content-end"
          style={{ whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column' }}
          >
            {selectedMessages.map((msg, idx) => (
              <div
                key={idx}
                onClick={() => handleReply(msg)}
                style={{
                  backgroundColor: msg.from_me ? '#dcf8c6' : '#f1f0f0',
                  textAlign: msg.from_me ? 'right' : 'left',
                  padding: '10px',
                  borderRadius: '10px',
                  margin: '5px 0',
                  maxWidth: '70%',
                  alignSelf: msg.from_me ? 'flex-end' : 'flex-start',
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
                {msg.body}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/*  INPUT DE MENSAGEM  */}
          <div
          className="p-3 w-100 d-flex justify-content-evenly message-input"
          style={{ backgroundColor: `var(--bg-color-${theme})` }}
          >
            <input
              className={`form-control input-${theme}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
