import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NewContactModal({ theme }) {
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [attendant, setAttendant] = useState('');
  const [connections, setConnections] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const url = 'https://landing-page-teste.8rxpnw.easypanel.host'
  useEffect(() => {

    const fetchConnections = async () => {
      console.log(userData.id)
      try {
        const response = await axios.post(`${url}/connection/getAllConnections`,{
          schema: userData.schema
        });
        setConnections(response.data);
      } catch (error) {
        console.error('Erro ao buscar conexões:', error);
      }
    };

    fetchConnections();
  }, []); 

  
if (!userData || !userData.id) {
  navigate('/')  
  return;
}

  const handleSave = async () => {
    if (!contactName || !contactNumber || !attendant) {
      console.error('Preencha todos os campos obrigatórios.');
      return;
    }
  
    try {
      const newContact = await axios.post('http://localhost:3000/contact/create-contact', {
        name: contactName,
        number: contactNumber,
        connection: attendant, 
        user_id: userData.id,
        schema: userData.schema,
      });
  
      console.log('Contato criado com sucesso:', newContact.data);
  
      setContactName('');
      setContactNumber('');
      setAttendant('');
    } catch (error) {
      console.error('Erro ao criar contato:', error);
    }
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
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.name}>
                    {connection.name}
                  </option>
                ))}
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