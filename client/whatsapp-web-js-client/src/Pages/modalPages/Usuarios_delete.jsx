import React, { useState } from 'react';

function DeleteUserModal({ theme, userToDelete }) {
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
    
  return (
    <div className="modal fade" id="DeleteUserModal" tabIndex="-1" aria-labelledby="DeleteUserModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-md">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header">
            <h5 className={`modal-title header-text-${theme}`} id="DeleteUserModalLabel">
              Confirmar Exclusão
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>

          <div className="modal-body">
            <p className={`card-subtitle-${theme} mb-1`}>Tem certeza que deseja excluir este usuário?</p>

            <p className="text-danger-true fw-bold mb-1">Nome: 
                <span className={`fw-bold header-text-${theme} ms-1`}>
                Vitor Bitencourt
                </span>
            </p>
            <p className="text-danger-true fw-bold mb-3">Email: 
                <span className={`fw-bold header-text-${theme} ms-1`}>
                    vitormbaraujo1306@gmail.com
                </span>
            </p>

            <p className={`card-subtitle-${theme}`}>Essa será uma ação irreversível. Para confirmar, preencha sua senha abaixo.</p>

            <input
              type="password"
              className={`form-control input-${theme} mt-2`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />

            {showError && (
              <p className="text-danger mt-2" style={{ display: showError ? 'block' : 'none' }}>
                Senha incorreta, tente novamente.
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className={`btn btn-2-${theme}`} data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" className={`btn btn-1-${theme}`}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
