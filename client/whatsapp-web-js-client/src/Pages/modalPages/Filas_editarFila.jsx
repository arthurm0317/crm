import axios from 'axios';
import React, { useState, useEffect } from 'react';

function EditQueueModal({ theme, fila }) {
  const [title, setTitle] = useState('');
  const [superUser, setSuperUser] = useState('');
  const [users, setUser] = useState([]);
  const [autoDistribution, setAutoDistribution] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user')); 
  const schema = userData?.schema;

  useEffect(() => {
    if (fila) {
      setTitle(fila.name || '');
      setSuperUser(fila.superuser || '');
      setAutoDistribution(fila.distribution || false);
    }
  }, [fila]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/users/${schema}`, {
          withCredentials: true
        });
        setUser(response.data.users || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsuarios();
  }, [schema]);

  const handleSave = async () => {
    if (!title || !superUser) {
      console.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_URL}/queue/update-queue`, {
        queueId: fila.id,
        name: title,
        super_user: superUser,
        distribution: autoDistribution,
        schema: schema,
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Recarregar a página para atualizar os dados
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao atualizar a fila:', error);
    }
  };

  return (
    <div className="modal fade" id="EditQueueModal" tabIndex="-1" aria-labelledby="EditQueueModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-sm">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-pencil-square header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`} id="EditQueueModalLabel">
              Editar Fila
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {/* Título */}
            <div className="mb-3">
              <label htmlFor="queueTitle" className={`form-label card-subtitle-${theme}`}>
                Título
              </label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                id="queueTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da fila"
              />
            </div>

            {/* Super-usuário */}
            <div className="mb-3">
              <label htmlFor="superUser" className={`form-label card-subtitle-${theme}`}>
                Super-usuário
              </label>
              <select
                className={`form-select input-${theme}`}
                id="superUser"
                value={superUser}
                onChange={(e) => setSuperUser(e.target.value)}
              >
                <option value="" disabled>
                  Escolha um usuário
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user ? user.name : '...'}
                  </option>
                ))}
              </select>
            </div>

            {/* Distribuição automática */}
            <div className="mb-3 form-check form-switch">
              <input
                className={`form-check-input input-${theme}`}
                type="checkbox"
                id="autoDistribution"
                checked={autoDistribution}
                onChange={() => setAutoDistribution((prev) => !prev)}
              />
              <label className={`form-check-label card-subtitle-${theme}`} htmlFor="autoDistribution">
                Distribuição automática
              </label>
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
              Atualizar Fila
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditQueueModal;
