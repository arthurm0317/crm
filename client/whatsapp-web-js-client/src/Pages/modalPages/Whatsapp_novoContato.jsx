import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import InputMask from 'react-input-mask';

function WhatsappNovoContatoModal({ theme, show, onHide, onSave }) {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('aguardando'); // aguardando, conectando, conectado, erro

  const handleClose = () => {
    if (onHide) onHide();
  };

  const handleSave = async () => {
    if (!nome || !numero) {
      console.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // Limpa o número para enviar só os dígitos
    const numeroLimpo = numero.replace(/\D/g, '');
    if (numeroLimpo.length !== 12) {
      console.error('Número inválido para EvolutionAPI.');
      return;
    }

    // Aqui você implementará a lógica de salvar
    if (onSave) {
      onSave({
        nome,
        numero: numeroLimpo,
        dataConexao: new Date().toISOString()
      });
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName={`bg-form-${theme}`}
      dialogClassName="custom-modal-width"
      size="lg"
    >
      <Modal.Header closeButton>
        <i className={`bi bi-whatsapp header-text-${theme} me-2`}></i>
        <Modal.Title className={`header-text-${theme}`}>
          Novo Contato WhatsApp
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="d-flex flex-column gap-3">
          {/* Botão Voltar */}
          <div>
            <button
              type="button"
              className={`btn btn-2-${theme}`}
              onClick={handleClose}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </button>
          </div>

          {/* Nome do Contato */}
          <div className="mb-3">
            <label htmlFor="nomeContato" className={`form-label card-subtitle-${theme}`}>
              Nome do Contato
            </label>
            <input
              type="text"
              className={`form-control input-${theme}`}
              id="nomeContato"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite um nome para identificar este contato"
            />
          </div>

          {/* Número do WhatsApp */}
          <div className="mb-3">
            <label htmlFor="numeroWhatsapp" className={`form-label card-subtitle-${theme}`}>
              Número do WhatsApp
            </label>
            <InputMask
              mask="+55 (99) 9999-9999"
              className={`form-control input-${theme}`}
              id="numeroWhatsapp"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="+55 (__) ____-____"
            />
          </div>

          {/* QR Code */}
          <div className="mb-3">
            <label className={`form-label card-subtitle-${theme}`}>
              QR Code
            </label>
            <div className={`p-4 border rounded input-${theme} text-center`} style={{ minHeight: '200px' }}>
              {status === 'aguardando' && (
                <div className={`card-subtitle-${theme}`}>
                  Clique em "Gerar QR Code" para iniciar a conexão
                </div>
              )}
              {status === 'conectando' && (
                <div className="d-flex flex-column align-items-center gap-2">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <div className={`card-subtitle-${theme}`}>
                    Gerando QR Code...
                  </div>
                </div>
              )}
              {status === 'conectado' && (
                <div className="text-success">
                  <i className="bi bi-check-circle-fill fs-1"></i>
                  <div className={`card-subtitle-${theme}`}>
                    Conectado com sucesso!
                  </div>
                </div>
              )}
              {status === 'erro' && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill fs-1"></i>
                  <div className={`card-subtitle-${theme}`}>
                    Erro ao gerar QR Code. Tente novamente.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          className={`btn btn-1-${theme}`}
          onClick={() => setStatus('conectando')}
          disabled={
            !nome ||
            !numero ||
            status === 'conectando' ||
            status === 'conectado' ||
            numero.replace(/\D/g, '').length !== 12
          }
        >
          Gerar QR Code
        </button>
        <button
          type="button"
          className={`btn btn-1-${theme}`}
          onClick={handleSave}
          disabled={!nome || !numero || status !== 'conectado' || numero.replace(/\D/g, '').length !== 12}
        >
          Salvar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

WhatsappNovoContatoModal.defaultProps = {
  show: false,
  onHide: () => {},
  onSave: () => {},
};

export default WhatsappNovoContatoModal; 