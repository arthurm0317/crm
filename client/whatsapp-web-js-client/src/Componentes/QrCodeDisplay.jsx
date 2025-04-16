import React from 'react';

const QrCodeDisplay = ({ session }) => {
  return (
    <div>
      <h2 className="text-xl mb-2">Sessão: {session.sessionName}</h2>
      {session.qr ? (
        <img src={session.qr} alt="QR Code" className="w-64" />
      ) : session.ready ? (
        <p className="text-green-600">Conectado ✅</p>
      ) : (
        <p>Aguardando QR Code...</p>
      )}
    </div>
  );
};

export default QrCodeDisplay;
