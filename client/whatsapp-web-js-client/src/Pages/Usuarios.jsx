import NewUserModal from './modalPages/Usuarios_modal';
import DeleteUserModal from './modalPages/Usuarios_delete';
import { useEffect, useState } from 'react';
import * as bootstrap from 'bootstrap';
import axios from 'axios';

function UsuariosPage({ theme }) {
  const userData = JSON.parse(localStorage.getItem('user')); 
  const schema = userData?.schema
  const [usuarios, setUsuarios] = useState([]);
  const url = 'https://landing-page-teste.8rxpnw.easypanel.host'

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));

    return () => tooltipList.forEach(tooltip => tooltip.dispose());
  }, [usuarios]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${url}/api/users/${schema}`);

        setUsuarios(response.data.users || []);
        console.log(response.data.users)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div className="h-100 w-100 mx-2">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <div className="input-group w-25">
          <input type="text" className={`form-control input-${theme}`} placeholder="Pesquisar..."/>
          <button 
          className={`btn btn-1-${theme}`} 
          data-bs-toggle="modal" 
          data-bs-target="#NewUserModal">
            Adicionar Usuário
          </button>
        </div>
      </div>

      <div className={`table-responsive custom-table-${theme}`}>
        <table className="table table-bordered table-hover m-0">
          <thead style={{ backgroundColor: 'yellow', color: 'indigo' }}>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.permission}</td>
                <td>
                  <button
                    className={`icon-btn btn-2-${theme} btn-user`}
                    data-bs-toggle="tooltip"
                    title="Editar"
                    onClick={() => {
                      const modal = new bootstrap.Modal(document.getElementById('NewUserModal'));
                      modal.show();
                    }}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>
                  <button
                    className="icon-btn text-danger"
                    data-bs-toggle="tooltip"
                    title="Excluir"
                    onClick={() => {
                      const modal = new bootstrap.Modal(document.getElementById('DeleteUserModal'));
                      modal.show();
                    }}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NewUserModal theme={theme}/>
      <DeleteUserModal theme={theme}/>
    </div>
  );
}

export default UsuariosPage;