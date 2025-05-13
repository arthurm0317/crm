import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import NewContactModal from './modalPages/Chats_novoContato';
import {socket} from '../socket'


function ChatPage({ theme }) {
  const [chatList, setChats] = useState([]);
  const [chat] = useState([])
  const [selectedMessages, setSelectedMessages] = useState([]);
  const previousMessagesRef = useRef(selectedMessages);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const selectedChatRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const schema = userData.schema;
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeAudio, setActiveAudio] = useState(null); 
  const [audioProgress, setAudioProgress] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const url = 'http://localhost:3000'
  const [messages, setMessages] = useState([])


  const [socketInstance] = useState(socket)


 useEffect(() => {
  if (socketInstance) {
    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor WebSocket');
    });

     socketInstance.on('message', (msg) => {
  if (msg.chatId === selectedChat?.id) {
    const formattedMessage = formatMessage(msg);
    setSelectedMessages((prev) => [...prev, formattedMessage]);
  } else {
    console.log(`Mensagem recebida para outro chat: ${msg.chatId}`);
  }
});

    return () => {
      socketInstance.off('message'); 
    };
  }
}, [socketInstance]); 

const handleSubmit = (data) => {
  if (!selectedChat) {
    console.warn('Nenhum chat selecionado!');
    return;
  }
  const newMessage = {
    instanceId: selectedChat.connection_id,
    number: selectedChat.contact_phone,
    text: data,
    chatId: selectedChat.id,
    from_me: true,
    schema: schema
  };

  if (socketInstance) {
    socketInstance.emit('message', newMessage);
    const formattedMessage = formatMessage(newMessage);
    setSelectedMessages((prev) => [...prev, formattedMessage]);
  } else {
    console.log('Sem socket');
  }
};

useEffect(() => {
  selectedChatRef.current = selectedChat;
}, [selectedChat]);

useEffect(() => {
  const loadChats = async () => {
  try {
    const res = await axios.get(`${url}/chat/getChat/${userData.id}/${schema}`);
    console.log('Resposta da API:', res.data); 
    setChats(res.data.messages); 
  } catch (err) {
    console.error('Erro ao carregar chats:', err);
  }
};
  loadChats();
}, [schema, userData.id, url]);

const formatMessage = (msg) => ({
  id: msg.id,
  name: msg.contact_name || msg.senderName,
  text: msg.text || msg.body,
  from_me: msg.from_me || false,
  timestamp: msg.timestamp || new Date().toISOString(),
  message_type: msg.message_type,
  base64: msg.midiaBase64 || msg.base64

});

const loadMessages = async (chatId) => {
  try {
    const res = await axios.post(`${url}/chat/getMessages`, {
      chat_id: chatId.id,
      schema,
    });


    const formattedMessages = res.data.messages.map(formatMessage);


    const newMessages = formattedMessages.filter(
      (msg) => !previousMessagesRef.current.some((prevMsg) => prevMsg.id === msg.id)
    );

    if (newMessages.length > 0) {
      setSelectedMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, ...newMessages];
        previousMessagesRef.current = updatedMessages;
        return updatedMessages;
      });
    }
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
  }
};

const handleChatClick = (chat) => {
  setSelectedChat(chat); // Atualiza o chat selecionado
  setSelectedChatId(chat.id); // Atualiza o id do chat selecionado
  setSelectedMessages([]); // Limpa as mensagens antigas
  previousMessagesRef.current = []; // Limpa a referência
  loadMessages(chat);
};


useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const AudioPlayer = ({ base64Audio, audioId }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
  
    const togglePlay = () => {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((err) => {
          console.error('Erro ao reproduzir áudio:', err);
        });
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
  
    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };
  
    const handleLoadedMetadata = () => {
      const audioDuration = audioRef.current.duration;
    
      if (isNaN(audioDuration)) {
        console.error('Erro ao carregar a duração do áudio. Verifique o formato do arquivo.');
        setDuration(0); 
      } else {
        setDuration(audioDuration); 
      }
    };
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    };
  
    const handleSeek = (e) => {
      const seekTime = (e.target.value / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    };
  
    return (
      <div className="audio-player d-flex align-items-center gap-3">
        {/* Botão Play/Pause */}
        <button
          className={`btn btn-sm btn-${isPlaying ? 'pause' : 'play'}`}
          onClick={togglePlay}
          style={{ 
            width: '30px', 
            height: '30px', 
            borderRadius: '50%' 
          }}
        >
          <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
        </button>
  
        {/* Barra de Progresso */}
        <div className="d-flex mt-2 flex-column flex-grow-1">
        <input
          type="range"
          className="form-range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          style={{
            cursor: 'pointer',
            }}
          />
          <div className="mt-2 d-flex justify-content-between">
            <small>{formatTime(currentTime)}</small>
            <small>{formatTime(duration)}</small>
          </div>
        </div>
  
        {/* Áudio */}
        <audio
          ref={audioRef}
          src={`data:audio/ogg;base64,${base64Audio}`}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    );
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  // const handleChatClick = async (chat) => {
  //   try {
  //     // Limpa as mensagens antigas antes de atualizar o chat selecionado
  //     setSelectedMessages([]);  // Limpa as mensagens
  //     previousMessagesRef.current = [];  // Limpa a referência
  
  //     setSelectedChatId(chat.id); // Atualiza o id do chat selecionado
  //     setSelectedChat(chat); // Atualiza o chat selecionado
  
  //     // Aguarda a atualização do estado antes de carregar as mensagens
  //     const res = await axios.post(`${url}/chat/getMessages`, {
  //       chat_id: chat.id,
  //       schema,
  //     });
  
  //     if (res.data.messages) {
  //       setSelectedMessages(res.data.messages);  // Define as mensagens do novo chat
  //       previousMessagesRef.current = res.data.messages;  // Atualiza a referência
  //     }
  
  //     scrollToBottom(); // Faz o scroll para o fundo após carregar as mensagens
  //   } catch (error) {
  //     console.error('Erro ao carregar mensagens do chat:', error);
  //   }
  // };
  

  const handleAudioClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
  
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    } else {
      setIsRecording(true);
      setRecordingTime(0);
  
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };
  
  const handleSendMessage = async () => {
    try {
      await axios.post(`${url}/evo/sendText`, {
        instanceId: selectedChat.connection_id,
        number: selectedChat.contact_phone,
        text: newMessage,
        chatId: selectedChat.id,
        schema: schema,
      });
  
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
  };
  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };


const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }    
    const formData = new FormData();
    formData.append('image', file); 
    formData.append('chatId', selectedChat.id);
    formData.append('connectionId', selectedChat.connection_id);
    formData.append('schema', schema);
    
    try {

      await axios.post(`${url}/chat/sendImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      

      const newMessage = {
        instanceId: selectedChat.connection_id,
        number: selectedChat.contact_phone,
        chatId: selectedChat.id,
        from_me: true,
        base64: file, 
        schema: schema,
      };

      console.log('Imagem carregada e preparada para o socket:', newMessage);

      if (socketInstance) {
        socketInstance.emit('message', newMessage);

        setSelectedMessages((prev) => [...prev, newMessage]);
      } else {
        console.log('Sem socket');
      }

      console.log('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
    }
  };


  const handleAudioRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaStreamRef.current = stream;
        setMediaRecorder(recorder);
  
        const chunks = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
  
        recorder.onstop = async () => {
          stopMediaStream();
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          if (audioBlob.size === 0) {
            return;
          }
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
  
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('chatId', selectedChat.id);
          formData.append('connectionId', selectedChat.connection_id);
          formData.append('schema', schema);
  
          try {
            console.log(formData)
            await axios.post(`${url}/chat/sendAudio`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (error) {
            console.error('Erro ao enviar áudio:', error);
          } finally {
            setAudioChunks([]);
          }
        };
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);

      } catch (error) {
        console.error('Erro ao acessar o microfone:', error);
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageClick = (imageBase64) => {
    setSelectedImage(imageBase64);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className={`d-flex flex-column h-100 w-100 ms-2`}>
      <div className="mb-3">
        <button 
        className={`btn btn-1-${theme}`}
        data-bs-toggle="modal"
        data-bs-target="#NewContactModal"
        >
          Novo Contato
        </button>
      </div>
      <div className={`chat chat-${theme} h-100 w-100 d-flex flex-row`}>

        {/* LISTA DE CONTATOS */}
        <div 
        className={`col-3 chat-list-${theme} bg-color-${theme}`} style={{ overflowY: 'auto', height: '100%', backgroundColor: `var(--bg-color-${theme})`}}>
          {chatList.map((chat) => (
          <div className='d-flex flex-row' key={chat.id}>
                <div 
                className={`selectedBar ${selectedChatId === chat.id ? '' : 'd-none'}`} style={{ width: '2.5%', maxWidth: '5px', backgroundColor: 'var(--primary-color)' }}></div>
                <div 
                  className={`h-100 w-100 input-${theme}`}
                  onClick={() => handleChatClick(chat)}
                  style={{ cursor: 'pointer', padding: '10px', borderBottom: `1px solid var(--border-color-${theme})` }}
                >
                  <strong>{chat.contact_name || chat.id || 'Sem Nome'}</strong>
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
                  ? (typeof chat.messages[chat.messages.length - 1] === 'string'
                      ? chat.messages[chat.messages.length - 1].slice(0, 40) + 
                        (chat.messages[chat.messages.length - 1].length > 50 ? '...' : '')
                      : 'Mensagem inválida')
                  : 'Sem mensagens'}
                  </div>
                </div>
              </div>
            ))}
            </div>

{/* MENSAGENS DO CONTATO SELECIONADO */}
<div
  className={`col-9 chat-messages-${theme} d-flex flex-column`}
>
  <div
    style={{
      height: '100%',
      maxHeight: '707.61px',
      overflow: 'hidden auto',
      border: '1px solid var(--border-color)',
    }}
  >
  
  <div
    id="corpoTexto"
    className="px-3 d-flex flex-column flex-grow-1"
    style={{
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      paddingTop: '5px',
      paddingBottom: '5px',
    }}
  >

  {selectedMessages.map((msg, index) => (
  <div
    key={msg.id || index}
    style={{
      backgroundColor: msg.from_me ? 'var(--hover)' : '#f1f0f0',
      textAlign: msg.from_me ? 'right' : 'left',
      padding: '5px 10px',
      borderRadius: '10px',
      margin: '5px 0',
      alignSelf: msg.from_me ? 'flex-end' : 'flex-start',
      display: 'inline-block',
      maxWidth: '60%',
    }}
  >
    {msg.message_type === 'audio' ? (
      <AudioPlayer base64Audio={msg.base64} audioId={msg.id} />
    ) : msg.message_type === 'imageMessage' || msg.message_type === 'image' ? (
      
     <img
  src={
    typeof msg.base64 === 'string'
      ? `data:image/jpeg;base64,${msg.base64}`  
      : msg.base64  
        }
        alt="imagem"
        style={{
          maxWidth: '300px',
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          display: 'block',
          cursor: 'pointer',
        }}
        onClick={() => handleImageClick(msg.base64)}
      />
) : (
  msg.text
)}

    {selectedImage && (
      <div
        className="image-modal"
        onClick={closeImageModal}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <img
          src={`data:image/jpeg;base64,${selectedImage}`}
          alt="imagem ampliada"
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
          }}
        />
      </div>
    )}

  </div>
))}
      <div ref={messagesEndRef} />
    </div>
  </div>

  {/* INPUT DE MENSAGEM */}
  <div
    className="p-3 w-100 d-flex justify-content-center message-input gap-2"
    style={{
      backgroundColor: `var(--bg-color-${theme})`,
      borderTop: '1px solid var(--border-color)',
      height: '70px',
    }}
  >
<button
  id="imagem"
  className={`btn btn-2-${theme}`}
  onClick={() => document.getElementById('imageInput').click()} 
>
  <i className="bi bi-image"></i>
</button>
<input
  id="imageInput"
  type="file"
  accept="image/*"
  style={{ display: 'none' }} 
  onChange={handleImageUpload}
/>
    <div
      id="campoEscrever"
      className={`py-0 px-2 form-control input-${theme} d-flex flex-row gap-2`}
      style={{ position: 'relative', width: '70%' }}
    >
      <div style={{ position: 'relative' }}>
        {!isRecording && (
        <button
          id="emoji"
          className={`btn d-flex justify-content-center align-items-center btn-2-${theme}`}
          style={{
            width: '35px',
            height: '35px',
            border: 'none',
          }}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <i className="bi bi-emoji-smile"></i>
        </button>
        )}
        
        {showEmojiPicker && !isRecording && (
          <div style={{ position: 'absolute', bottom: '40px', left: '0', zIndex: 1000 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme === 'light' ? 'light' : 'dark'} />
          </div>
        )}
      </div>

            <input
        type="text"
        placeholder={isRecording ? '' : 'Digite sua mensagem...'}
        value={isRecording ? '' : newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        disabled={isRecording}
        style={{
          width: '100%',
          color: isRecording
            ? 'var(--error-color)'
            : theme === 'light'
            ? 'var(--color-light)'
            : 'var(--color-dark)',
          borderColor: isRecording ? 'var(--error-color)' : '',
          backgroundColor: 'transparent',
          border: 'none',
        }}
      />
      {isRecording && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <i
            className="bi bi-record-circle"
            style={{ color: 'var(--error-color)' }}
          ></i>
          <span>{`${Math.floor(recordingTime / 60)}:${String(
            recordingTime % 60
          ).padStart(2, '0')}`}</span>
        </div>
      )}
    </div>

    <button
      id="audio"
      className={`btn btn-2-${theme}`}
      onClick={() => {
        if (isRecording) {
          // Cancelar gravação
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.onstop = null; // Evita envio
            mediaRecorder.stop();
            stopMediaStream();
          }
          setIsRecording(false);
          setRecordingTime(0);
          setAudioChunks([]);
        } else {
          handleAudioRecording(); // Iniciar gravação
        }
      }}
      style={{
        color: isRecording ? 'var(--error-color)' : '',
        borderColor: isRecording ? 'var(--error-color)' : '',
      }}
    >
      <i className={`bi ${isRecording ? 'bi-x' : 'bi-mic'}`}></i>
    </button>

    <button
      id="enviar"
      className={`btn btn-2-${theme}`}
      onClick={() => {
        if (isRecording) {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          setIsRecording(false);
          setRecordingTime(0);
        } else {
          handleSubmit(newMessage)
          handleSendMessage();
        }
      }}
    >
      <i className="bi bi-send"></i>
    </button>

  </div>
</div>
      </div>
      <NewContactModal theme={theme}/>
    </div>
  );
}

export default ChatPage;
