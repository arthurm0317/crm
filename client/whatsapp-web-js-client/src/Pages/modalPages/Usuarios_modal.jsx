import React, { useState } from 'react';
import axios from 'axios';

function NewUserModal({ theme }) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const handleSave = async () => {
    if (!userName || !userEmail || !userRole) {
      console.error('Preencha todos os campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user/create', {
        name: userName,
        email: userEmail,
        role: userRole,
      });

      console.log('Usuário criado:', response.data);

      setUserName('');
      setUserEmail('');
      setUserRole('');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  return (
    <div className="modal fade" id="NewUserModal" tabIndex="-1" aria-labelledby="NewUserModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-sm">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header">
            <h5 className={`modal-title header-text-${theme}`} id="NewUserModalLabel">
              Dados do Usuário
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            {/* Nome */}
            <div className="mb-3">
              <label htmlFor="userName" className={`form-label card-subtitle-${theme}`}>
                Nome
              </label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="userEmail" className={`form-label card-subtitle-${theme}`}>
                Email
              </label>
              <input
                type="email"
                className={`form-control input-${theme}`}
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Digite o email"
              />
            </div>

            {/* Perfil */}
            <div className="mb-3">
              <label htmlFor="userRole" className={`form-label card-subtitle-${theme}`}>
                Perfil
              </label>
              <select
                className={`form-select input-${theme}`}
                id="userRole"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="" disabled>Selecione um perfil</option>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
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
              Criar Usuário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUserModal;