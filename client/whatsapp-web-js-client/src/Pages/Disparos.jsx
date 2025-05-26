import React, { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Card, Button } from 'react-bootstrap';
import DisparoModal from './modalPages/Disparos_novoDisparo';
import DeleteDisparoModal from './modalPages/Disparos_delete';

function DisparosPage({ theme }) {
  const [disparoSelecionado, setDisparoSelecionado] = useState(null);
  // Exemplo de dados - substitua por dados reais da sua API
  const [disparos, setDisparos] = useState([
    {
      id: '001',
      titulo: 'Disparo de Boas-vindas',
      dataInicio: '2024-03-20 14:30:00',
      gmt: 'GMT-3',
      status: 'Agendado'
    },
    {
      id: '002',
      titulo: 'Campanha Promocional',
      dataInicio: '2024-03-21 09:00:00',
      gmt: 'GMT-3',
      status: 'Em execução'
    },
    {
      id: '003',
      titulo: 'Lembrete de Pagamento',
      dataInicio: '2024-03-22 08:00:00',
      gmt: 'GMT-3',
      status: 'Pendente'
    },
    {
      id: '004',
      titulo: 'Newsletter Semanal',
      dataInicio: '2024-03-23 10:00:00',
      gmt: 'GMT-3',
      status: 'Agendado'
    },
    {
      id: '005',
      titulo: 'Pesquisa de Satisfação',
      dataInicio: '2024-03-24 15:45:00',
      gmt: 'GMT-3',
      status: 'Em execução'
    },
    {
      id: '006',
      titulo: 'Promoção Flash',
      dataInicio: '2024-03-25 12:00:00',
      gmt: 'GMT-3',
      status: 'Agendado'
    },
    {
      id: '007',
      titulo: 'Atualização de Cadastro',
      dataInicio: '2024-03-26 09:30:00',
      gmt: 'GMT-3',
      status: 'Pendente'
    }
  ]);

  // Inicialização dos tooltips
  useEffect(() => {
    let tooltipList = [];
    let deleteModal = null;

    try {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (tooltipTriggerList.length > 0) {
        tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
      }

      // Inicializa o modal de exclusão
      const modalElement = document.getElementById('DeleteDisparoModal');
      if (modalElement) {
        deleteModal = new bootstrap.Modal(modalElement);
      }
    } catch (error) {
      console.error('Erro ao inicializar componentes:', error);
    }

    return () => {
      if (tooltipList.length > 0) {
        tooltipList.forEach(t => {
          if (t && t._element) {
            t.dispose();
          }
        });
      }
      if (deleteModal) {
        deleteModal.dispose();
      }
    };
  }, []);

  const handleEdit = (id) => {
    const disparo = disparos.find(d => d.id === id);
    setDisparoSelecionado(disparo);
    const modal = new bootstrap.Modal(document.getElementById('DisparoModal'));
    modal.show();
  };

  const handleDelete = (id) => {
    const disparo = disparos.find(d => d.id === id);
    setDisparoSelecionado(disparo);
    const modalElement = document.getElementById('DeleteDisparoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  const handleNovoDisparo = () => {
    setDisparoSelecionado(null);
    const modal = new bootstrap.Modal(document.getElementById('DisparoModal'));
    modal.show();
  };

  const handleDisparoDeleted = () => {
    // Aqui você implementará a atualização da lista após a exclusão
    // Por enquanto, vamos apenas simular removendo do estado local
    if (disparoSelecionado) {
      setDisparos(disparos.filter(d => d.id !== disparoSelecionado.id));
      setDisparoSelecionado(null);
    }
  };

  return (
    <div className="h-100 w-100 ms-2">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <div className="input-group" style={{ width: '30%' }}>
          <input
            type="header-text"
            className={`form-control input-${theme}`}
            placeholder="Pesquisar..."
          />
          <button 
            className={`btn btn-1-${theme} d-flex gap-2`}
            onClick={handleNovoDisparo}
          >
            <i className="bi-plus-lg"></i>
            Novo Disparo
          </button>        
        </div>
      </div>

      <div className={`w-100 h-100 table-responsive custom-table-${theme}`}
        style={{
          maxHeight: '777.05px',
          overflowY: 'auto'
        }}
      >
        <div className="d-flex flex-column gap-3 p-3 w-100">
          {disparos.map((disparo) => (
            <div 
              key={disparo.id}
              className={`d-flex flex-row justify-content-between align-items-stretch p-3 card-${theme} border-${theme} rounded w-100`}
            >
              {/* Seção de Dados */}
              <div className="d-flex flex-column flex-grow-1">
                <div className={`header-text-${theme} fw-bold`}>ID: {disparo.id}</div>
                <div className={`header-text-${theme} h5 mb-2`}>{disparo.titulo}</div>
                <div className={`header-text-${theme} mb-1`}>
                  Início: {disparo.dataInicio} ({disparo.gmt})
                </div>
                <div className={`header-text-${theme}`}>
                  Status: <span className={`fw-bold`}>
                    {disparo.status}
                  </span>
                </div>
              </div>

              {/* Divider Vertical */}
              <div className={`border-end border-${theme} mx-3`} style={{ minHeight: '100px' }}></div>

              {/* Seção de Ações */}
              <div className="d-flex flex-column gap-2 justify-content-center">
                <button
                  className={`btn btn-2-${theme} w-100`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="left"
                  data-bs-title="Editar"
                  onClick={() => handleEdit(disparo.id)}
                >
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                  className={`btn delete-btn w-100`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="left"
                  data-bs-title="Excluir"
                  onClick={() => handleDelete(disparo.id)}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Novo/Editar Disparo */}
      <DisparoModal theme={theme} disparo={disparoSelecionado} />

      {/* Modal de Exclusão */}
      <DeleteDisparoModal theme={theme} disparo={disparoSelecionado} onDelete={handleDisparoDeleted} />
    </div>
  );
}

export default DisparosPage; 