import React, { useState } from 'react';
import InputMask from 'react-input-mask';

function NewContactModal({ theme }) {
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [attendant, setAttendant] = useState('');

  const handleSave = () => {
    console.log('Nome do Contato:', contactName);
    console.log('Número do Contato:', contactNumber);
    console.log('Conexão:', attendant);
    // Aqui você pode adicionar a lógica para salvar os dados
  };

  return (
    <div className="modal fade" id="NewContactModal" tabIndex="-1" aria-labelledby="NewContactModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-sm">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header">
            <h5 className={`modal-title header-text-${theme}`} id="NewContactModalLabel">
              Novo Contato
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {/* Nome do Contato */}
            <div className="mb-3">
              <label
                htmlFor="contactName"
                className={`form-label card-subtitle-${theme}`}
              >
                Nome do Contato
              </label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Digite o nome do contato"
              />
            </div>

            {/* Número do Contato */}
            <div className="mb-3">
              <label
                htmlFor="contactNumber"
                className={`form-label card-subtitle-${theme}`}
              >
                Contato
              </label>
              <InputMask
                mask="+55 (99) 99999-9999"
                className={`form-control input-${theme}`}
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+55 (__) _____-____"
              />
            </div>

            {/* Conexão */}
            <div className="mb-3">
              <label
                htmlFor="attendant"
                className={`form-label card-subtitle-${theme}`}
              >
                Conexão
              </label>
              <select
                className={`form-select input-${theme}`}
                id="attendant"
                value={attendant}
                onChange={(e) => setAttendant(e.target.value)}
              >
                <option value="" disabled>
                  Selecione uma conexão
                </option>
                <option value="suporte">Suporte</option>
                <option value="vendas">Vendas</option>
                <option value="financeiro">Financeiro</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">

            <button
              type="button"
              className={`btn btn-2-${theme}`}
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>

            <button
              type="button"
              className={`btn btn-1-${theme}`}
              onClick={handleSave}
            >
              Entrar em Contato
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default NewContactModal;