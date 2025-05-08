import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import NewContactModal from './modalPages/Chats_novoContato';

function ChatPage({ theme }) {
  const [chats, setChats] = useState([]);
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

  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post('http://localhost:3000/chat/getMessages', {
          chat_id: selectedChat.id,
          schema,
        });

        const newMessages = res.data.messages.filter(
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
        console.error('Erro ao atualizar mensagens do chat selecionado:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedChat, schema]);

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
    
      if (isNaN(audioDuration) || !isFinite(audioDuration)) {
        console.error('Erro ao carregar a duração do áudio. Verifique o formato do arquivo.');
        setDuration(0); // Define a duração como 0 em caso de erro
      } else {
        setDuration(audioDuration); // Define a duração corretamente
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

  const handleChatClick = async (chat) => {
    setSelectedChatId(chat.id);
    try {
      setSelectedChat(chat);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao carregar mensagens do chat:', error);
    }
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
      // Envia a mensagem para o backend
      await axios.post('http://localhost:3000/evo/sendText', {
        instanceId: selectedChat.connection_id,
        number: selectedChat.contact_phone,
        text: newMessage,
        chatId: selectedChat.id,
        schema: schema,
      });
  
      // Limpa o campo de texto após o envio
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

      await axios.post('http://localhost:3000/chat/sendImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
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
            await axios.post('http://localhost:3000/chat/sendAudio', formData, {
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
          {Array.isArray(chats) &&
            chats.map((chat) => (
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
                      ? typeof chat.messages[chat.messages.length - 1] === 'string'
                        ? chat.messages[chat.messages.length - 1].slice(0, 40) + (chat.messages[chat.messages.length - 1].length > 50 ? '...' : '')
                        : 'Mensagem inválida'
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

  {selectedMessages.map((msg) => (
  <div
    key={msg.id}
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
    ) : msg.message_type === 'image' ? (
      <img
        src={`data:image/jpeg;base64,${msg.base64}`}
        alt="imagem"
        style={{ 
          maxWidth: '300px',
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          display: 'block'
        }}
      />
    ) : (
      msg.body
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
