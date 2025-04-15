import React, { useEffect, useState } from 'react';
import { startSession, getAllSessions } from './api';
import SidebarSessions from './Componentes/SidebarSessions';
import QRCodeDisplay from './Componentes/QrCodeDisplay';

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
    }
  };

  const handleNewSession = async () => {
    const name = prompt('Nome da nova sessão:');
    if (name) {
      await startSession(name);
      setTimeout(loadSessions, 1000);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const sessionData = sessions.find((s) => s.sessionName === selectedSession);

  return (
    <div className="flex h-screen">
      <SidebarSessions
        sessions={sessions}
        selected={selectedSession}
        onSelect={setSelectedSession}
      />
      <div className="flex-1 p-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={handleNewSession}
        >
        <img src="" alt="" />
          + Nova Sessão
        </button>
        {sessionData ? (
          <QRCodeDisplay session={sessionData} />
        ) : (
          <p>Selecione uma sessão para ver o QR Code.</p>
        )}
      </div>
    </div>
  );
};

export default App;
