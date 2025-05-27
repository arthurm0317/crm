import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const tableContainerStyle = {
  maxHeight: '400px',
  overflowY: 'auto'
};

function WhatsappFilasModal({ theme, show, onHide, contato, filas = [] }) {
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
        <i className={`bi bi-diagram-3 header-text-${theme} me-2`}></i>
        <Modal.Title className={`header-text-${theme}`}>
          Filas Vinculadas ao WhatsApp
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="d-flex flex-column gap-3">
          {/* Botão Voltar */}
          <div>
            <button
              type="button"
              className={`btn btn-2-${theme}`}
              onClick={onHide}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </button>
          </div>

          {/* Informações do Contato */}
          <div className="mb-3">
            <h6 className={`card-subtitle-${theme}`}>
              Contato: <strong>{contato?.nome}</strong>
            </h6>
            <p className={`card-subtitle-${theme}`}>
              Número: {contato?.numero}
            </p>
          </div>

          {/* Lista de Filas */}
          <div className="table-responsive" style={tableContainerStyle}>
            <table className={`custom-table-${theme} align-middle w-100`}>
              <thead>
                <tr>
                  <th className="text-start px-3 py-2">Nome da Fila</th>
                  <th className="text-start px-3 py-2">Setor</th>
                  <th className="text-start px-3 py-2">Data de Vinculação</th>
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center px-3 py-2">
                      <span className={`card-subtitle-${theme}`}>Nenhuma fila vinculada a este contato.</span>
                    </td>
                  </tr>
                ) : (
                  filas.map((fila, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">{fila.nome}</td>
                      <td className="px-3 py-2">{fila.setor}</td>
                      <td className="px-3 py-2">{new Date(fila.dataVinculacao).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default WhatsappFilasModal;