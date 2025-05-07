import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import NewContactModal from './modalPages/Chats_novoContato';

function ChatPage({ theme }) {
  const [chats, setChats] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
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
        
        setSelectedMessages(res.data.messages);
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

  const AudioPlayer = ({ base64Audio }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    const intervalRef = useRef(null);
    
    const audioUrl = `data:audio/ogg;base64,${base64Audio}`;
  
    const updateProgress = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
      }
    };
  
    const togglePlay = () => {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        intervalRef.current = setInterval(updateProgress, 1000);
      }
    };
  
    const handleProgressChange = (e) => {
      const newProgress = e.target.value;
      audioRef.current.currentTime = newProgress;
      setProgress(newProgress);
    };
  
    const handleLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
    };
  
    const handleEnded = () => {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    };
  
    return (
      <div className="audio-player">
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        
        <button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleProgressChange}
          />
          <span>{`${Math.floor(progress / 60)}:${String(progress % 60).padStart(2, '0')}`}</span> / 
          <span>{`${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`}</span>
        </div>
      </div>
    );
  };  

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleChatClick = async (chat) => {
    setSelectedChatId(chat.id);
    try {
      const res = await axios.post('http://localhost:3000/chat/getMessages', {
        chat_id: chat.id,
        schema,
      });
      console.log(res.data.messages);
      setSelectedChat(chat);
      setSelectedMessages(res.data.messages);
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

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
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
                      ? chat.messages[chat.messages.length - 1]
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
      overflowY: 'auto',
      border: '1px solid var(--border-color)',
    }}
  >
    <div
      id="corpoTexto"
      className="px-3 pt-3 pb-2 h-100 d-flex flex-column"
      style={{
        whiteSpace: 'pre-wrap',
        flex: 1,
      }}
    >
      {selectedMessages.map((msg, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: msg.from_me ? 'var(--hover)' : '#f1f0f0',
            textAlign: msg.from_me ? 'right' : 'left',
            padding: '10px',
            borderRadius: '10px',
            margin: '5px 0',
            maxWidth: '70%',
            alignSelf: msg.from_me ? 'flex-end' : 'flex-start',
          }}
        >
          
          {msg.message_type === 'audio' ? (
            <AudioPlayer base64Audio={msg.base64} />
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
      onClick={() => {}}
    >
      <i className="bi bi-image"></i>
    </button>

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
