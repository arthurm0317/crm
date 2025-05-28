import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function WhatsappDeleteModal({ theme, show, onHide, contato, onDelete }) {
  const userData = JSON.parse(localStorage.getItem('user')); 
  const schema = userData?.schema
  const url = process.env.REACT_APP_URL;
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${url}/connection/delete/${contato.id}/${contato.name}/${schema}`)
    } catch (error) {
      console.error(error)
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
      size="md"
    >
      <Modal.Header closeButton>
        <i className={`bi bi-trash header-text-${theme} me-2`}></i>
        <Modal.Title className={`header-text-${theme}`}>
          Excluir Contato WhatsApp
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Botão Voltar */}
        <div className="mb-3">
          <button
            type="button"
            className={`btn btn-2-${theme}`}
            onClick={onHide}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
        </div>

        <p className={`card-subtitle-${theme} mb-1`}>
          Tem certeza que deseja excluir este contato?
        </p>
        <p className="text-danger-true fw-bold mb-1">
          Nome:
          <span className={`fw-bold header-text-${theme} ms-1`}>
            {contato?.name}
          </span>
        </p>
        <p className="text-danger-true fw-bold mb-1">
          Número:
          <span className={`fw-bold header-text-${theme} ms-1`}>
            {contato?.number}
          </span>
        </p>
        <p className={`card-subtitle-${theme}`}>
          Esta ação não pode ser desfeita e removerá o acesso de todos os usuários vinculados a este número.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          className={`btn btn-2-${theme}`}
          onClick={onHide}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`btn btn-1-${theme}`}
          onClick={handleDelete}
        >
          Excluir
        </button>
      </Modal.Footer>
    </Modal>
  );
}

WhatsappDeleteModal.defaultProps = {
  show: false,
  onHide: () => {},
  onDelete: () => {},
};

export default WhatsappDeleteModal; 