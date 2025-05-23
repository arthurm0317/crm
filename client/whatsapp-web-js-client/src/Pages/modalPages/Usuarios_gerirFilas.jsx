import React, { useState } from 'react';

function UserFilasModal({ theme, filas = ['Vendas', 'Relacionamento', 'Financeiro'], filasSelecionadas = [], onChange }) {
  const [selectedFilas, setSelectedFilas] = useState(filasSelecionadas);

  const handleToggleFila = (fila) => {
    let novasFilas;
    if (selectedFilas.includes(fila)) {
      novasFilas = selectedFilas.filter(f => f !== fila);
    } else {
      novasFilas = [...selectedFilas, fila];
    }
    setSelectedFilas(novasFilas);
    if (onChange) onChange(novasFilas);
  };

  return (
    <div className="modal fade" id="UserFilasModal" tabIndex="-1" aria-labelledby="UserFilasModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-centered modal-dialog-scrollable">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-folder header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`} id="UserFilasModalLabel">
              Gerir Filas
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>

          <div className="modal-body">
            <div className="list-group">
              {filas.map((fila) => (
                <label
                  key={fila}
                  className={`list-group-item d-flex align-items-center gap-2 input-${theme}`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    checked={selectedFilas.includes(fila)}
                    onChange={() => handleToggleFila(fila)}
                  />
                  {fila}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className={`btn btn-2-${theme}`}
              data-bs-dismiss="modal"
            >
              Fechar
            </button>
            <button
              type="button"
              className={`btn btn-1-${theme}`}
              data-bs-dismiss="modal"
              onClick={() => onChange && onChange(selectedFilas)}
            >
              Salvar Filas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserFilasModal;