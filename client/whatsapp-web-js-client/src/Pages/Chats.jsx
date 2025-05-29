import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import NewContactModal from './modalPages/Chats_novoContato';
import {socket} from '../socket'
import {Dropdown} from 'react-bootstrap';
import './assets/style.css';
import NewQueueModal from './modalPages/Filas_novaFila';
import { Modal } from 'react-bootstrap';

function formatDate(timestamp) {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatHour(timestamp) {
  const date = new Date(Number(timestamp));
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const DropdownComponent = ({ onCloseChat, theme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleCloseChat = () => {
    setShowDropdown(false);
    onCloseChat();
  };

  return (
    <div ref={dropdownRef}>
      <Dropdown 
        show={showDropdown} 
        onToggle={(isOpen) => setShowDropdown(isOpen)}
        align="end"
      >
        <Dropdown.Toggle 
          variant={theme === 'light' ? 'light' : 'dark'}
          id="dropdown-basic"
          className={`btn-2-${theme}`}
        >
          Opções
        </Dropdown.Toggle>

        <Dropdown.Menu 
          variant={theme === 'light' ? 'light' : 'dark'}
          className={`input-${theme}`}
        >
          <Dropdown.Item onClick={handleCloseChat}>Finalizar Atendimento</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

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
  const [messages, setMessages] = useState([])
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('')
  const selectedChatIdRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState('conversas'); // novo estado
  const [showNovoContatoModal, setShowNovoContatoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [socketInstance] = useState(socket)
  
  const url = process.env.REACT_APP_URL;

  const setAsRead = async (chatId) => {
    if (!chatId) return;
    
    try {
      const res = await axios.post(`${url}/chat/setAsRead`, {
        chat_id: chatId,
        schema: schema
      });
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

const handleAcceptChat = async () => {
    try{
      const res = await axios.post(`${url}/chat/setUser`,{
        user_id: userData.id,
        chat_id: selectedChat.id,
        schema: userData.schema
      })
      setChats(prevChats =>
      prevChats.map(c =>
        c.id === selectedChat.id
          ? { ...c, status: 'open', assigned_user: userData.id }
          : c
      )
    );

    }catch(error){
      console.error(error)
    }
  }

  const handleChatClick = (chat) => {
    if (!chat || !chat.id) return;
    
    setSelectedChat(chat);
    setSelectedChatId(chat.id);
    setSelectedMessages([]);
    previousMessagesRef.current = [];
    selectedChatIdRef.current = chat.id;
    loadMessages(chat);
    setAsRead(chat.id);
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unreadmessages: false } : c
      )
    );
    scrollToBottom();
  };

  useEffect(() => {
  if (socketInstance && selectedChatId) {
    socketInstance.emit('join', selectedChatId);

    const handleMessage = (msg) => {
    if (msg.chatId === selectedChatId) {
      const formatted = formatMessage(msg);
      setSelectedMessages(prev => [...prev, formatted]);
    }
  };
    socketInstance.on('message', handleMessage);

    return () => {
      socketInstance.emit('leave', selectedChatId);
      socketInstance.off('message', handleMessage);
    };
  }
}, [socketInstance, selectedChatId]);

 useEffect(() => {
  if (socketInstance) {
    socketInstance.on('connect', () => {
    });
    socketInstance.on('chats_updated', (updatedChats) => {
  let chats = [];
  if (Array.isArray(updatedChats)) {
    chats = updatedChats;
  } else if (updatedChats && typeof updatedChats === 'object') {
    chats = [updatedChats];
  }
  if (chats.length > 0) {
    setChats(prevChats => {
      const updatedMap = new Map(chats.map(chat => [chat.id, chat]));
      const merged = prevChats.map(chat => updatedMap.get(chat.id) || chat);
      chats.forEach(chat => {
        if (!prevChats.some(c => c.id === chat.id)) {
          merged.push(chat);
        }
      });
      return merged;
    });
  }
});
  }
  return () => {
    if (socketInstance) {
      socketInstance.off('connect');
      socketInstance.off('chats_updated');
    }
  };
}, [socketInstance, userData.id]);
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
    schema: schema,
    created_at: new Date(),
  };

  if (socketInstance) {
    socketInstance.emit('message', newMessage);
    const formattedMessage = formatMessage(newMessage);
    setSelectedMessages((prev) => [...prev, formattedMessage]);
  } else {
  }
};

useEffect(() => {
  selectedChatRef.current = selectedChat;
}, [selectedChat]);

const loadChats = async () => {
    try {
      const res = await axios.get(`${url}/chat/getChat/${userData.id}/${schema}/${userData.role}`);
      setChats(Array.isArray(res.data.messages) ? res.data.messages : []);;
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
    }
  };

useEffect(() => {
    loadChats();
  }, [schema, userData.id, url]);

const formatMessage = (msg) => ({
  id: msg.id,
  name: msg.contact_name || msg.senderName,
  text: msg.text || msg.body,
  from_me: msg.from_me|| msg.fromMe,
  timestamp: msg.timestamp || msg.created_at,
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
     const audioSrc = base64Audio && base64Audio.startsWith('blob:')
        ? base64Audio
        : `data:audio/ogg;base64,${base64Audio}`;
  
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
          src={audioSrc}
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
      const newImageUrl = URL.createObjectURL(file); 
        setImageUrl(newImageUrl);

      await axios.post(`${url}/chat/sendImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      

      const message = {
          id: newImageUrl,
          text: null,
          from_me: true,
          timestamp:  new Date(),
          message_type: 'image',
          base64:newImageUrl,
          created_at: new Date(),
          }
      if (socketInstance) {
        socketInstance.emit('message', message);

        setSelectedMessages((prev) => [...prev, message]);
      } else {
        console.log('Sem socket');
      }

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

        const newAudioUrl = URL.createObjectURL(audioBlob); 
        setAudioUrl(newAudioUrl); 

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
            await axios.post(`${url}/chat/sendAudio`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            const message = {
              id: audioBlob,
              text: null,
              from_me: true,
              timestamp:  new Date(),
              message_type: 'audio',
              base64:newAudioUrl,
              created_at: new Date()
            }
            if (socketInstance) {
            socketInstance.emit('message', message);
            const formattedMessage = formatMessage(message);
            setSelectedMessages((prev) => [...prev, formattedMessage]);
          } else {
            console.log('Sem socket');
          }
          }catch (error) {
            console.error('Erro ao enviar áudio:', error);
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

  useEffect(() => {
  scrollToBottom();
}, [selectedMessages]);

  const handleImageClick = (imageBase64) => {
    setSelectedImage(imageBase64);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  

  return (
    <div className="pt-3 d-flex flex-column h-100 w-100 ms-2" style={{ flex: 1 }}>
      <div className="mb-3 d-flex flex-row align-items-center">
        <h2 className={`mb-0 ms-3 me-5 header-text-${theme}`} style={{ fontWeight: 400 }}>Chats</h2>
        <button 
          className={`btn btn-1-${theme} d-flex gap-2`}
          onClick={() => setShowNovoContatoModal(true)}
        >
          <i className="bi-plus-lg"></i>
          Novo Contato
        </button>
      </div>

      <div className={`chat chat-${theme} d-flex flex-row flex-grow-1`} style={{ height: '70%' }}>
        {/* Lista de Contatos */}
        <div 
          className={`col-3 chat-list-${theme} bg-color-${theme} d-flex flex-column`}
          style={{ 
            maxWidth: '300px',
            backgroundColor: `var(--bg-color-${theme})`,
            borderTopLeftRadius: '5px'
          }}
        >
          {/* Container dos botões e título */}
          <div className="d-flex flex-column">
            {/* Botões de troca */}
            <div className="d-flex gap-2 p-2">
              <button
                className={`d-flex gap-2 btn btn-sm ${selectedTab === 'conversas' ? `btn-1-${theme}` : `btn-2-${theme}`}`}
                onClick={() => setSelectedTab('conversas')}
              >
                <i className="bi bi-chat-left-text"></i>
                Conversas
              </button>
              <button
                className={`d-flex gap-2 btn btn-sm ${selectedTab === 'aguardando' ? `btn-1-${theme}` : `btn-2-${theme}`}`}
                onClick={() => setSelectedTab('aguardando')}
              >
                <i className="bi bi-alarm"></i>
                Aguardando
              </button>
            </div>

            {/* Título da lista */}
            <h6 
              className={`header-text-${theme} mb-0`}
              style={{padding: '8px 10px'}}
            >
              {selectedTab === 'conversas' ? 'Conversas' : 'Sala de Espera'}
            </h6>
          </div>

          {/* Lista de chats com scroll */}
          <div style={{overflowY: 'auto', flex: 1 }}>
            {chatList
              .filter(chat =>
                selectedTab === 'conversas'
                  ? chat.status !== 'waiting'
                  : chat.status === 'waiting'
              )
              .map((chat) => (
                <div className='msg d-flex flex-row' key={chat.id}>
                  <div
                    className={`selectedBar ${selectedChatId === chat.id ? '' : 'd-none'}`}
                    style={{ width: '2.5%', maxWidth: '5px', backgroundColor: 'var(--primary-color)' }}></div>
                  <div
                    className={`h-100 w-100 input-${theme}`}
                    onClick={() => handleChatClick(chat)}
                    style={{ cursor: 'pointer', padding: '10px', borderBottom: `1px solid var(--border-color-${theme})` }}
                  >
                    <strong>{chat.contact_name || chat.id || 'Sem Nome'}</strong>
                    <div className='d-flex flex-column align-items-center justify-content-center'>
                      {chat.unreadmessages && selectedChatId !== chat.id && (
                        <span style={{
                          position: 'sticky',
                          width: 12,
                          height: 12,
                          left:'100%',
                          background: '#0082ca',
                          borderRadius: '50%',
                          display: 'inline-block'
                        }} />
                      )}
                    </div>
                    <div
                      style={{
                        color: '#666',
                        fontSize: '0.9rem',
                        overflowY: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {Array.isArray(chat.messages) && chat.messages.length > 0
                        ? (typeof chat.messages[chat.messages.length - 1] === 'string'
                            ? chat.messages[chat.messages.length - 1].slice(0, 40) +
                              (chat.messages[chat.messages.length - 1].length > 50 ? '...' : '')
                            : 'Mensagem de mídia')
                        : 'Sem mensagens'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div 
          className={`w-100 chat-messages-${theme} d-flex flex-column justify-content-between`} 
          style={{ borderTopRightRadius: '10px' }}
        >
          {selectedChat && (
            <>
              <div 
                className="d-flex justify-content-between align-items-center flex-row px-3 py-2"
                style={{
                  borderTopRightRadius: '5px',
                  backgroundColor: `var(--bg-color-${theme})`,
                  color: `var(--color-${theme})`,
                  borderBottom: `1px solid var(--border-color-${theme})`,
                  minHeight: '82.19px',
                  width: '100%',
                  maxWidth: '1700px',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>
                    {selectedChat.contact_name || 'Sem Nome'}
                  </strong>
                  <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                    {selectedChat.contact_phone || selectedChat.id}
                  </div>
                </div>

                <div className='d-flex flex-row gap-2'>
                  {selectedChat && selectedChat.status === 'waiting' && (
                    <div>
                      <button
                        className={`btn btn-2-${theme} d-flex gap-2`}
                        onClick={handleAcceptChat}
                      >
                        <i className="bi bi-check2"></i>
                        Aceitar
                      </button>
                    </div>
                  )}

      <div>
       <DropdownComponent
        theme={theme}
        selectedChat={selectedChat}
        handleChatClick={handleChatClick}
        setChats={setChats}
        setSelectedChat={setSelectedChat}
        setSelectedMessages={setSelectedMessages}
      />
      </div>

    </div>

  </div>  
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
      paddingBottom: '20px',
    }}
  >

  {(() => {
  let lastDate = null;
  return selectedMessages.map((msg, index) => {
    const msgDate = formatDate(msg.timestamp);
    const showDate = !lastDate || lastDate !== msgDate;
    lastDate = msgDate;

    return (
      <React.Fragment key={msg.id || index}>
        {showDate && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '16px 0 8px 0',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                background: '#e0e0e0',
                color: '#333',
                borderRadius: '12px',
                padding: '4px 16px',
                fontSize: '0.95rem',
                fontWeight: 500,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {msgDate}
            </div>
          </div>
        )}
        <div
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
          {msg.message_type === 'audio' || msg.message_type === 'audioMessage' ? (
            <AudioPlayer base64Audio={msg.base64} audioId={msg.id} />
          ) : msg.message_type === 'imageMessage' || msg.message_type === 'image' ? (
            <img
              src={
                typeof msg.base64 === 'string'
                  ? msg.base64.startsWith('blob:')
                    ? msg.base64
                    : `data:image/jpeg;base64,${msg.base64}`
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
          {/* Horário formatado */}
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
            {formatHour(msg.timestamp)}
          </div>
        </div>
      </React.Fragment>
    );
  });
})()}

{/* Renderize o modal de imagem ampliada fora do map */}
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
      <div ref={messagesEndRef} />
    </div>
  </div>

              {/* Input de Mensagem */}
              <div 
                className="p-3 w-100 d-flex justify-content-center message-input gap-2"
                style={{
                  borderBottomRightRadius: '5px',
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isRecording) {
                        handleSubmit(newMessage);
                        handleSendMessage();
                      }
                    }}
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
                      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                        mediaRecorder.onstop = null;
                        mediaRecorder.stop();
                        stopMediaStream();
                      }
                      setIsRecording(false);
                      setRecordingTime(0);
                      setAudioChunks([]);
                    } else {
                      handleAudioRecording();
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
            </>
          )}
        </div>
      </div>

      <NewContactModal 
        theme={theme} 
        show={showNovoContatoModal} 
        onHide={() => setShowNovoContatoModal(false)}
      />
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
        className={`modal-${theme}`}
      >
        <Modal.Header closeButton className={`modal-header-${theme}`}>
          <Modal.Title className={`text-${theme === 'dark' ? 'light' : 'dark'}`}>
            Imagem
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={`modal-body-${theme}`}>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="imagem ampliada"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ChatPage;