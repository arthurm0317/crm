import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import NewContactModal from './modalPages/Chats_novoContato';
import ChangeQueueModal from './modalPages/Chats_alterarFila';
import AgendarMensagemModal from './modalPages/Chats_agendarMensagem';
import ListaAgendamentosModal from './modalPages/Chats_agendamentosLista';
import {socket} from '../socket'
import {Dropdown} from 'react-bootstrap';
import './assets/style.css';
import NewQueueModal from './modalPages/Filas_novaFila';
import WaveSurfer from 'wavesurfer.js';
import ChatsMenuLateral from './modalPages/Chats_menuLateral';

function formatHour(timestamp) {
  const date = new Date(Number(timestamp));
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
  const date = new Date(Number(timestamp));
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Verifica se é hoje
  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';
  }
  // Verifica se é ontem
  else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }
  // Outros dias
  else {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}

function groupMessagesByDate(messages) {
  const grouped = [];
  let currentDate = null;
  let currentGroup = [];

  messages.forEach((message, index) => {
    const messageDate = formatDate(message.timestamp);
    
    if (messageDate !== currentDate) {
      // Salva o grupo anterior se existir
      if (currentGroup.length > 0) {
        grouped.push({
          type: 'date',
          date: currentDate,
          messages: currentGroup
        });
      }
      
      // Inicia novo grupo
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      // Adiciona à mensagem ao grupo atual
      currentGroup.push(message);
    }
    
    // Se for a última mensagem, salva o grupo
    if (index === messages.length - 1) {
      grouped.push({
        type: 'date',
        date: currentDate,
        messages: currentGroup
      });
    }
  });

  return grouped;
}

function DropdownComponent({ theme, selectedChat, handleChatClick, setChats, setSelectedChat, setSelectedMessages, onEditName }) {
  const url = process.env.REACT_APP_URL;
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData.schema;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangeQueueModal, setShowChangeQueueModal] = useState(false);
  const [showListaAgendamentosModal, setShowListaAgendamentosModal] = useState(false);
  const [showAgendarMensagemModal, setShowAgendarMensagemModal] = useState(false);
  const [queues, setQueues] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const handleToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  const handleCloseChat = async () => {
    try {
      const res = await axios.post(`${url}/chat/close`, {
        chat_id: selectedChat.id,
        schema: userData.schema
      });
      setChats(prevChats => prevChats.filter(c => c.id !== selectedChat.id));
      setSelectedChat(null)
      setSelectedMessages([])
    } catch (error) {
      console.error(error)
    }
  };
  const handleEditContactName = async (newName) => {
      try {
        await axios.put(`${url}/contact/update-name`, {
          number:selectedChat.contact_phone,
          name: newName,
          schema:schema
        });
      } catch (error) {
        console.error(error)
      }
  };
  useEffect(() => {
    async function fetchQueues() {
      try {
        const res = await axios.get(`${url}/queue/get-all-queues/${schema}`);
        setQueues(res.data.result || []);
      } catch (err) {
        setQueues([]);
      }
    }
    if (isDropdownOpen) fetchQueues();
  }, [isDropdownOpen, url, schema]);

  const handleTransferQueue = async (queueId) => {
    if (!selectedChat) return;
    setTransferLoading(true);
    try {
      await axios.post(`${url}/queue/transfer-queue`, {
        chatId: selectedChat.id,
        newQueueId: queueId,
        schema
      });

      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChat.id ? { ...chat, queue_id: queueId } : chat
        )
      );
      setSelectedChat(prev =>
        prev ? { ...prev, queue_id: queueId } : prev
      );
    } catch (err) {
      alert('Erro ao transferir fila');
    }
    setTransferLoading(false);
  };
  return (
    <>
      <Dropdown drop="start" onToggle={setIsDropdownOpen}>
        <Dropdown.Toggle
          variant={theme === 'light' ? 'light' : 'dark'}
          id="dropdown-basic"
          className={`btn-2-${theme}`}
        >
          Opções
        </Dropdown.Toggle>

        <Dropdown.Menu
          variant={theme === 'light' ? 'light' : 'dark'}
          className={`input-${theme}`}>
  

          <Dropdown.Divider />
          <Dropdown.Item href="#" onClick={() => setShowChangeQueueModal(true)}>Alterar Fila</Dropdown.Item>
          <Dropdown.Item href="#" onClick={handleCloseChat}>Finalizar Atendimento</Dropdown.Item>
          <Dropdown.Item href="#" onClick={onEditName}>Editar Nome</Dropdown.Item>
          <Dropdown.Item href="#" onClick={() => setShowListaAgendamentosModal(true)}>Agendar mensagem</Dropdown.Item>
          {/* <Dropdown.Item href="#" onClick={() => setShowTagModal(true)}>Gerenciar Tags</Dropdown.Item> */}
        </Dropdown.Menu>
      </Dropdown>

  <ChangeQueueModal
    show={showChangeQueueModal}
    onHide={() => setShowChangeQueueModal(false)}
    theme={theme}
    selectedChat={selectedChat}
    schema={schema}
    url={url}
    onTransfer={handleTransferQueue}
/>

  <ListaAgendamentosModal
    show={showListaAgendamentosModal}
    onHide={() => setShowListaAgendamentosModal(false)}
    theme={theme}
    selectedChat={selectedChat}
    onAgendarNovaMensagem={() => {
      setShowListaAgendamentosModal(false);
      setTimeout(() => setShowAgendarMensagemModal(true), 200);
    }}
  />

  <AgendarMensagemModal
    show={showAgendarMensagemModal}
    onHide={() => setShowAgendarMensagemModal(false)}
    theme={theme}
    selectedChat={selectedChat}
  />
    </>
  );
}

function ChatPage({ theme, chat_id} ) {
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
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [messages, setMessages] = useState([])
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('')
  const selectedChatIdRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState('conversas'); // novo estado
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [connections, setConnections] = useState([]);
  const nomeContatoRef = useRef(null);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const [socketInstance] = useState(socket)  
  const url = process.env.REACT_APP_URL;
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [sideMenuActive, setSideMenuActive] = useState(false);

  const setAsRead = async()=>{
    if (!selectedChat) return;
    try{
      const res = await axios.post(`${url}/chat/setAsRead`,{
        chat_id: selectedChat.id,
        schema:schema
      })
    }catch(error){
      console.error(error)
    }
  }

  const handleEditNameStart = () => {
  setIsEditingName(true);
  setEditedName(selectedChat?.contact_name || '');
  setTimeout(() => {
    if (nomeContatoRef.current) nomeContatoRef.current.focus();
  }, 0);
};

useEffect(() => {
  if (chat_id && chatList.length > 0) {
    if (!selectedChat || selectedChat.id !== chat_id) {
      const chat = chatList.find(c => c.id === chat_id);
      handleChatClick(chat)
      if (chat) setSelectedChat(chat);
    }
  }
}, [chat_id, chatList, selectedChat]);

const handleEditNameFinish = async () => {
  if (
    editedName.trim() !== '' &&
    editedName !== selectedChat.contact_name
  ) {
    await handleEditContactName(selectedChat.id, editedName);
  }
  setIsEditingName(false);
};

useEffect(() => {
  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${url}/connection/get-all-connections/${schema}`);
      setConnections(res.data || []);
    } catch (err) {
      setConnections([]);
    }
  };
  fetchConnections();
}, [url, schema]);

const getConnectionName = (connectionId) => {
  const conn = connections.find(c => c.id === connectionId);
  return conn?.name || connectionId;
};

const handleEditContactName = async (contactId, newName) => {
  try {
    await axios.put(`${url}/contact/update-name`, {
      number: selectedChat.contact_phone,
      name: newName,
      user_id:userData.id,
      schema: userData.schema
    });
    // Atualize o nome no chat selecionado (opcional)
    setSelectedChat(prev => ({ ...prev, contact_name: newName }));
    // Atualize na lista de chats (opcional)
    setChats(prev =>
      prev.map(chat =>
        chat.id === contactId ? { ...chat, contact_name: newName } : chat
      )
    );
  } catch (error) {
    console.error(error);
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

const disableBot = async () => {
  if (!selectedChat) return;
  
  try {
    // Mapear a role para o valor correto
    const roleValue = userData.role === 'admin' ? 'admin' : 'user';
    
    await axios.post(`${url}/chat/disable-bot`, {
      chat_id: selectedChat.id,
      schema: schema,
      role: roleValue
    });
    setIsBotActive(false);
  } catch (error) {
    console.error('Erro ao desativar bot:', error);
  }
};

  const handleChatClick = (chat) => {
  setSelectedChat(chat);
  setSelectedChatId(chat.id);
  setSelectedMessages([]);
  previousMessagesRef.current = [];
  selectedChatIdRef.current = chat.id; 
  loadMessages(chat);
  setAsRead()
  setChats(prevChats =>
    prevChats.map(c =>
      c.id === chat.id ? { ...c, unreadmessages: false } : c
    )
  );  
  scrollToBottom()
  
  // Carregar status do bot do banco de dados
  if (chat.isboton) {
    setIsBotActive(true);
  } else {
    setIsBotActive(false);
  }
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
      socketInstance.emit('join', `schema_${schema}`);
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
      // Sai da sala do schema ao desconectar
      socketInstance.emit('leave', `schema_${schema}`);
    }
  };
}, [socketInstance, userData.id, schema]);
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
    timestamp: Date.now(),
    schema: schema
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

const AudioPlayer = ({ audioSrc, audioId, theme, isActive, onPlayClick }) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const isSeekingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleSeek = useCallback((e) => {
    if (!wavesurferRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    wavesurferRef.current.seekTo(progress);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (!isReady) return;
    isSeekingRef.current = true;
    handleSeek(e);
  }, [isReady, handleSeek]);

  const handleMouseMove = useCallback((e) => {
    if (isSeekingRef.current) {
      handleSeek(e);
    }
  }, [handleSeek]);

  const handleMouseUp = useCallback(() => {
    isSeekingRef.current = false;
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const source = audioSrc.startsWith('blob:') ? audioSrc : `data:audio/ogg;base64,${audioSrc}`;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: theme === 'light' ? '#E0E0E0' : '#555555',
      progressColor: '#34B7F1',
      barWidth: 2,
      barGap: 1.5,
      barRadius: 2,
      height: 'auto',
      cursorWidth: 0,
      url: source,
      dragToSeek: true,
      fillParent: true,
    });
    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setIsReady(true);
      // Força o WaveSurfer a se redesenhar com o tamanho correto do contêiner
      window.dispatchEvent(new Event('resize'));
    });

    ws.on('audioprocess', (time) => setCurrentTime(time));
    ws.on('seek', (progress) => setCurrentTime(progress * ws.getDuration()));
    
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    
    ws.on('finish', () => {
      onPlayClick(null);
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioSrc, theme, onPlayClick]);

  useEffect(() => {
    if (!isReady) return;
    if (isActive) {
      wavesurferRef.current?.play();
    } else {
      wavesurferRef.current?.pause();
    }
  }, [isActive, isReady]);

  const handlePlayButtonClick = () => {
    if (isReady) {
      onPlayClick(isActive ? null : audioId);
    }
  };
  
  const cursorPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player-container" style={{ width: '100%' }}>
      <div className="audio-player d-flex align-items-center gap-3 flex-grow-1" style={{width: '100%'}}>
        <button
          className={`btn btn-sm`}
          onClick={handlePlayButtonClick}
          disabled={!isReady}
          style={{
            width: '35px', height: '35px', borderRadius: '50%',
            backgroundColor: 'var(--primary-color)', color: 'white',
            flexShrink: 0, opacity: isReady ? 1 : 0.5,
            cursor: isReady ? 'pointer' : 'not-allowed',
          }}
        >
          <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: '1.1rem' }}></i>
        </button>

        <div
          id={`waveform-container-${audioId}`}
          ref={containerRef}
          style={{ 
            flexGrow: 1, 
            height: '35px',
            maxHeight: '35px', 
            position: 'relative', 
            cursor: isReady ? 'pointer' : 'default', 
            width: '100%',
            display: 'block',
          }}
          onMouseDown={handleMouseDown}
          className="waveform"
        >
        </div>

        <small className="text-muted" style={{ minWidth: '80px', textAlign: 'center' }}>
          {isReady ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '0:00 / 0:00'}
        </small>
      </div>
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
          timestamp:  new Date().toISOString(),
          message_type: 'image',
          base64:newImageUrl
          }
      if (socketInstance) {
        socketInstance.emit('message', message);

        setSelectedMessages((prev) => [...prev, message]);
      } else {
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
              timestamp:  new Date().toISOString(),
              message_type: 'audio',
              base64:newAudioUrl
            }
            if (socketInstance) {
            socketInstance.emit('message', message);
            const formattedMessage = formatMessage(message);
            setSelectedMessages((prev) => [...prev, formattedMessage]);
          } else {
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
    <div className={`d-flex flex-column w-100 h-100 ms-2`} style={{ overflow: 'hidden' }}>
      <div className="pt-3 mb-3 d-flex flex-row align-items-center gap-5" style={{ height: '7%' }}>
        <h2 className={`mb-0 ms-4 header-text-${theme}`} style={{ fontWeight: 400 }}>Chats</h2>

        <button 
          className={`btn btn-sm btn-1-${theme} d-flex align-items-center gap-2`}
          style={{ height: '90%' }}
          onClick={() => setShowNewContactModal(true)}
        >
          <i className="bi-plus-lg"></i>
          Novo Contato
        </button>
      </div>
      <div 
        className={`chat chat-${theme} w-100 d-flex flex-row`}
        style={{ height: '100%', overflow: 'hidden' }}
      >
        {/* LISTA DE CONTATOS */}
        <div className={`col-3 chat-list-${theme} bg-color-${theme} d-flex flex-column`}
          style={{ 
            height: '100%', 
            width: '100%',
            maxWidth: '300px',
            backgroundColor: `var(--bg-color-${theme})`,
            overflow: 'hidden',
            position: 'relative'
          }}>

          <div style={{ 
            height: '12.5%', 
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: `var(--bg-color-${theme})`
          }}>
            {/* Botões de troca */}
            <div className="d-flex gap-2 px-2" style={{ paddingTop: '8px' }}>
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

            {/* Lista filtrada */}
            <div className='p-3'>
              <h6 
                className={`header-text-${theme} m-0`}
              >
                {selectedTab === 'conversas' ? 'Conversas' : 'Sala de Espera'}
              </h6>
            </div>

          </div>

          <div 
            className={``}
            style={{ 
              height: 'auto', 
              overflowY: 'auto'
            }}
          >
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
                    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  }}
>
  <strong>{chat.contact_name || chat.id || 'Sem Nome'}</strong>
  <span
  title={getConnectionName(chat.connection_id)}
  style={{
    background: '#e0e0e0',
    color: '#333',
    borderRadius: '6px',
    padding: '0 6px',
    fontSize: '0.65rem',
    marginLeft: '6px',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    lineHeight: '18px',
    height: '18px',
    verticalAlign: 'middle'
  }}
>
  {getConnectionName(chat.connection_id)}
</span>
</div>

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
                            : 'Mensagem de mídia')
                        : 'Sem mensagens'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
{/* MENSAGENS DO CONTATO SELECIONADO */}
<div
  className={`w-100 chat-messages-${theme} d-flex flex-column`}
  style={{ borderTopRightRadius: '10px', position: 'relative' }}
>
{selectedChat && (
  <div
    className="d-flex justify-content-between align-items-center flex-row px-3 py-2"
    style={{
      borderTopRightRadius: '5px',
      backgroundColor: `var(--bg-color-${theme})`,
      color: `var(--color-${theme})`,
      borderBottom: `1px solid var(--border-color-${theme})`,
      minHeight: '95.11px',
      width:'100%',
      maxWidth:'1700px',
    }}
  >

    <div>
     {isEditingName ? (
  <input
    ref={nomeContatoRef}
    id="nomeContato"
    type="text"
    value={editedName}
    onChange={e => setEditedName(e.target.value)}
    onBlur={handleEditNameFinish}
    onKeyDown={e => {
      if (e.key === 'Enter') handleEditNameFinish();
    }}
    style={{
      fontWeight: 700,
      fontSize: '1.1rem',
      border: '1px solid var(--border-color)',
      borderRadius: 4,
      padding: '2px 8px',
      minWidth: 120,
      background: 'transparent',
      color: `var(--color-${theme})`,
    }}
  />
) : (
  <strong
    id="nomeContato"
    style={{ fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
    onClick={handleEditNameStart}
  >
    {selectedChat.contact_name || 'Sem Nome'}
  </strong>
)}
      <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>
        {selectedChat.contact_phone || selectedChat.id}
      </div>
    </div>

    <div className='d-flex flex-row gap-2'>

      <button
        className={`btn btn-2-${theme} d-flex gap-2`}
        onClick={isBotActive ? disableBot : undefined}
        disabled={!isBotActive}
        title={isBotActive ? "Desativar Bot" : "Bot Desativado"}
      >
        <i className={`bi ${isBotActive ? 'bi-pause':'bi-play-fill'}`}></i>
      </button>

      {selectedChat && selectedChat.status === 'waiting' && (
  <div>
    <button
      className={`btn btn-2-${theme} d-flex gap-2`}
      // AQUI VEM O ON CLICK DO ACCEPT
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
        onEditName={handleEditNameStart}
        editedName={editedName}
      />
      </div>

      {/* Botão person-gear */}
      <button
        className={`btn btn-2-${theme} d-flex align-items-center`}
        style={{ marginLeft: '4px' }}
        onClick={() => {
          setShowSideMenu(true);
          setTimeout(() => setSideMenuActive(true), 10);
        }}
      >
        <i className="bi bi-person-gear"></i>
      </button>

      {/* MENU LATERAL SOBREPOSTO */}
      {showSideMenu && (
        <ChatsMenuLateral
          theme={theme}
          onClose={() => {
            setSideMenuActive(false);
            setTimeout(() => setShowSideMenu(false), 300);
          }}
          style={{
            opacity: sideMenuActive ? 1 : 0,
            transform: sideMenuActive ? 'translateX(0)' : 'translateX(100%)',
          }}
        />
      )}

    </div>

  </div>
)}
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

  {groupMessagesByDate(selectedMessages).map((group, groupIndex) => (
    <div key={groupIndex}>
      {/* Cabeçalho da data */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '12px 0 12px 0',
        }}
      >
        <div
          style={{
            backgroundColor: '#f0f0f0',
            color: '#666',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {group.date}
        </div>
      </div>

      {/* Mensagens do grupo */}
      {group.messages.map((msg, index) => (
        <div
          key={msg.id || index}
          style={{
            display: 'flex',
            justifyContent: msg.from_me ? 'flex-end' : 'flex-start',
            margin: '5px 0',
          }}
        >
          <div
            style={{
              backgroundColor: msg.from_me ? 'var(--hover)' : '#f1f0f0',
              textAlign: msg.from_me ? 'right' : 'left',
              padding: '10px 10px 5px 10px',
              borderRadius: '10px',
              maxWidth: '100%',
              width: (msg.message_type === 'audio' || msg.message_type === 'audioMessage') ? '50%' : 'fit-content',
            }}
          >
            {(msg.message_type === 'audio' || msg.message_type === 'audioMessage') ? (
              <AudioPlayer 
                audioSrc={msg.base64} 
                audioId={msg.id} 
                theme={theme} 
                isActive={activeAudioId === msg.id}
                onPlayClick={setActiveAudioId}
              />
            ) : (msg.message_type === 'imageMessage' || msg.message_type === 'image') ? (
              <>
                {msg.text && (
                  <div style={{ marginBottom: '5px' }}>
                    {msg.text}
                  </div>
                )}
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
              </>
            ) : (
              msg.text && (
                <div>
                  {msg.text}
                </div>
              )
            )}
            {/* Horário formatado */}
            <div style={{ fontSize: '0.75rem', color: '#888'}}>
              {formatHour(msg.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  ))}

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

  {/* INPUT DE MENSAGEM */}
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
      <NewContactModal 
        theme={theme} 
        show={showNewContactModal} 
        onHide={() => setShowNewContactModal(false)}
      />
    </div>
  );
}

export default ChatPage;