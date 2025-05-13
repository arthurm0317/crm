import React, { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';
import axios from 'axios';

function FilaPage({ theme }) {
  const [filas, setFilas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  const url = 'https://landing-page-teste.8rxpnw.easypanel.host';

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
    return () => tooltipList.forEach(t => t.dispose());
  }, [filas]);

  useEffect(() => {
    const fetchFilas = async () => {
      try {
        const response = await axios.get(`${url}/api/filas/${schema}`);
        setFilas(response.data.filas || []);
      } catch (error) {
        console.error('Erro ao buscar filas:', error);
      }
    };
    fetchFilas();
  }, []);

  const filasFiltradas = filas.filter(fila =>
    fila.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-100 w-100 mx-2">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <div className="input-group" style={{ width: '30%' }}>
          <input
            type="text"
            className={`form-control input-${theme}`}
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`btn btn-1-${theme}`}
            data-bs-toggle="modal"
            data-bs-target="#NewFilaModal"
          >
            Nova Fila
          </button>
        </div>
      </div>

      <div className={`table-responsive custom-table-${theme}`}>
        <table className="table table-bordered table-hover m-0">
          <thead style={{ backgroundColor: 'yellow', color: 'indigo' }}>
            <tr>
              <th>Nome</th>
              <th>Cor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filasFiltradas.map((fila) => (
              <tr key={fila.id}>
                <td>{fila.nome}</td>
                <td>
                  <span
                    style={{
                      backgroundColor: fila.cor,
                      padding: '5px 10px',
                      borderRadius: '5px',
                      color: '#fff'
                    }}
                  >
                    {fila.cor}
                  </span>
                </td>
                <td>
                  <button
                    className={`icon-btn btn-2-${theme} me-1`}
                    data-bs-toggle="tooltip"
                    title="Gerenciar"
                    onClick={() => {}}
                  >
                    <i className="bi bi-people-gear"></i>
                  </button>
                  <button
                    className={`icon-btn btn-2-${theme} me-1`}
                    data-bs-toggle="tooltip"
                    title="Editar"
                    onClick={() => {}}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="icon-btn text-danger"
                    data-bs-toggle="tooltip"
                    title="Excluir"
                    onClick={() => {}}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Aqui você irá importar e usar os modais futuramente */}
    </div>
  );
}

export default FilaPage;