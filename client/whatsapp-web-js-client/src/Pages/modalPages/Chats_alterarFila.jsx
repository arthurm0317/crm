import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import './assets/style.css';

function ChangeQueueModal({ show, onHide, theme, selectedChat, schema, url, onTransfer }) {
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [queues, setQueues] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (show && schema && url) {
      axios.get(`${url}/queue/get-all-queues/${schema}`,
        {
      withCredentials: true
    })
        .then(res => setQueues(res.data.result || []))
        .catch(() => setQueues([]));
    }
  }, [show, schema, url]);

  useEffect(() => {
    let timer;
    if (show && countdown > 0 && isConfirming) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, show, isConfirming]);

  useEffect(() => {
    if (show) {
      setCountdown(3);
      setIsConfirming(false);
      setSelectedQueue(null);
    }
  }, [show]);

  const handleConfirm = () => {
    setIsConfirming(true);
    setCountdown(3);
  };

  const handleChangeQueue = async () => {
    if (!selectedQueue) return;
    await onTransfer(selectedQueue.id);
    setIsConfirming(false);
    setSelectedQueue(null);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={`modal-${theme}`}
    >
      <Modal.Header 
        closeButton 
        className={`modal-header-${theme} bg-form-${theme}`}
      >
        <Modal.Title className={`header-text-${theme}`}>
          Alterar Fila
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`modal-body-${theme} bg-form-${theme}`}>
        {/* Informações do contato */}
        <div className="mb-4">
          <h6 className={`header-text-${theme}`}>Informações do Contato</h6>
          <div className={`input-${theme} p-3 rounded`} style={{ border: `1px solid var(--border-color-${theme})` }}>
            <p className="mb-1"><strong>Nome:</strong> {selectedChat?.contact_name || 'Sem nome'}</p>
            <p className="mb-0"><strong>Número:</strong> {selectedChat?.contact_phone || 'Não disponível'}</p>
          </div>
        </div>

        {/* Seleção de fila */}
        <div className="mb-4">
          <h6 className={`header-text-${theme}`}>Nova Fila</h6>
          <div className="queue-selector">
            {queues.map((queue) => (
              <div
                key={queue.id}
                className={`queue-option ${selectedQueue?.id === queue.id ? 'selected' : ''} input-${theme}`}
                onClick={() => setSelectedQueue(queue)}
                style={{
                  border: `2px solid ${queue.color}`,
                  backgroundColor: selectedQueue?.id === queue.id ? `${queue.color}20` : 'transparent',
                  cursor: 'pointer',
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <div 
                  className="queue-color-indicator"
                  style={{ backgroundColor: queue.color, width: 16, height: 16, borderRadius: '50%' }}
                />
                <span>{queue.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso */}
        <div 
          className={`alert d-flex justify-content-center`}
          style={{ 
            backgroundColor: 'transparent',
            border: `1px solid var(--error-color)`,
            color: `var(--error-color)`
          }}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Atenção: Esta alteração não poderá ser desfeita.
        </div>

        {/* Botão de confirmação com contagem regressiva */}
        {isConfirming && (
          <div className="text-center mt-3">
            <Button
              variant="danger"
              disabled
              className="w-100"
            >
              Confirmar alteração em {countdown}s
            </Button>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={`modal-footer-${theme} bg-form-${theme}`}>
        <Button 
          variant="secondary" 
          onClick={onHide}
          className={`btn-2-${theme}`}
        >
          Cancelar
        </Button>
        {!isConfirming ? (
          <Button
            style={{ backgroundColor: 'transparent' }}
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedQueue}
            className={`btn-2-${theme}`}
          >
            Alterar Fila
          </Button>
        ) : countdown > 0 ? (
          <Button
            variant="danger"
            disabled
            className={`btn-2-${theme}`}
          >
            Confirmar alteração em {countdown}s
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={handleChangeQueue}
            className={`btn-2-${theme}`}
          >
            Confirmar Alteração
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ChangeQueueModal;