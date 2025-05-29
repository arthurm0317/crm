import React from 'react';
import axios from 'axios';

function WhatsappDeleteModal({ theme, show, onHide, contato, onDelete }) {
  const userData = JSON.parse(localStorage.getItem('user')); 
  const schema = userData?.schema
  const url = process.env.REACT_APP_URL;
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${url}/connection/delete/${contato.id}/${contato.name}/${schema}`)
      onDelete(contato);
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-trash header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`}>Confirmar Exclusão</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            <p className={`card-subtitle-${theme} mb-1`}>
              Tem certeza que deseja excluir o contato <strong>{contato?.name}</strong>?
            </p>
            <p className="text-danger-true fw-bold mb-1">
              Nome:
              <span className={`fw-bold header-text-${theme} ms-1`}>
                {contato?.name}
              </span>
            </p>
            <p className="text-danger-true fw-bold mb-3">
              Número:
              <span className={`fw-bold header-text-${theme} ms-1`}>
                {contato?.number}
              </span>
            </p>
            <p className={`card-subtitle-${theme}`}>
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className={`btn btn-2-${theme}`} onClick={onHide}>
              Cancelar
            </button>
            <button type="button" className={`btn btn-1-${theme}`} onClick={handleDelete}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

WhatsappDeleteModal.defaultProps = {
  show: false,
  onHide: () => {},
  onDelete: () => {},
};

export default WhatsappDeleteModal; 