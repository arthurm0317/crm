import React, { useEffect, useState } from 'react';
import SidebarSessions from './Componentes/SidebarSessions';
import QRCodeDisplay from './Componentes/QrCodeDisplay';
import axios from 'axios';

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [instanceName, setInstanceName] = useState('');
  const [number, setNumber] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [instances, setInstances] = useState([]);

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    if (!instanceName || !number) return alert('Preencha todos os campos');
  
    try {
      const response = await axios.post('http://localhost:3000/evo/instance', {
        instanceName,
        number,
      });

      console.log('Instância criada:', response.data);

      const base64 = response.data?.result?.qrcode?.base64;
      if (base64) {
        setQrCodeBase64(base64);
      }

      setInstanceName('');
      setNumber('');
    } catch (err) {
      console.error('Erro ao criar instância:', err.message);
    }
  };

  const LoadInstances = async () => {
    try {
      const response = await axios.get('http://localhost:3000/evo/fetchInstances', {
        params: { schema: 'public' }
      });
  
      console.log('Resposta da API:', response.data);
  
      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        setInstances(response.data.result);
      } else {
        console.error('A resposta da API não contém um array em "result"');
      }
    } catch (err) {
      console.error('Erro ao carregar instâncias:', err);
    }
  };
  useEffect(() => {
    LoadInstances();
  }, []);

  const sessionData = sessions.find((s) => s.sessionName === selectedSession);

  return (
    <div className="flex h-screen">
      <SidebarSessions
        sessions={sessions}
        selected={selectedSession}
        onSelect={setSelectedSession}
      />
      
      <div className="flex-1 p-4">
        <div>
          {instances.map((inst, index) => (
            <div key={index}>
              <h3>{inst.name}</h3>
              <p>Status: {inst.connectionStatus}</p>
              <img src={inst.profilePicUrl} alt="Foto de perfil" width={100} />
            </div>
          ))}
        </div>
        
        <button
          onClick={LoadInstances}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Carregar Instâncias
        </button>

        <form className="mb-4 space-y-2" onSubmit={handleCreateInstance}>
          <input
            type="text"
            placeholder="Nome da instância"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Número"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Criar Instância
          </button>
          
          {qrCodeBase64 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">QR Code da nova instância:</h3>
              <img src={`${qrCodeBase64}`} alt="QR Code" className="max-w-xs" />
            </div>
          )}
        </form>

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
