import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/style.css';

function Painel() {
  return (
    <div className="bg-screen-light" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="d-flex h-100">
        {/* Sidebar */}
        <div id="sidebar" className="bg-form-light h-100 sidebar sidebar-collapsed">
          <div id="sidebar-top" style={{ height: '10%', width: '100%' }} className="p-2 d-flex flex-row align-items-center justify-content-evenly">
            <img src="assets/favicon.png" alt="Logo" className="img-fluid" style={{ height: 'auto', width: '65%' }} />
          </div>

          <div style={{ flexGrow: 1, width: '100%' }} id="sidebar-body" className="d-flex flex-column align-items-center justify-content-start my-5 gap-3">
            <button id="dashboard" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Dashboard" className="btn btn-1-light btn-selected d-flex flex-row align-items-center justify-content-start gap-2">
              <i className="bi bi-speedometer2"></i>
              <span className="sidebar-label d-none">Dashboard</span>
            </button>

            <button id="chats" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Chats" className="btn btn-2-light">
              <i className="bi bi-chat-dots"></i>
              <span className="sidebar-label d-none">Chats</span>
            </button>

            <button id="usuarios" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Usuários" className="btn btn-2-light">
              <i className="bi bi-people"></i>
              <span className="sidebar-label d-none">Usuários</span>
            </button>

            <button id="lembretes" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Lembretes" className="btn btn-2-light">
              <i className="bi bi-bell"></i>
              <span className="sidebar-label d-none">Lembretes</span>
            </button>

            <button id="relatorios" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Relatórios" className="btn btn-2-light">
              <i className="bi bi-bar-chart-line"></i>
              <span className="sidebar-label d-none">Relatórios</span>
            </button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="d-flex flex-column flex-grow-1">
          {/* Header */}
          <div className="header-light ps-1 pe-4 d-flex align-items-center justify-content-between" style={{ height: '10%' }}>
            <button data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Expandir/Retrair" id="toggleSidebar" className="btn btn-3-light p-1">
              <i className="bi bi-arrow-bar-right"></i>
            </button>

            <div id="header-title" className="d-flex flex-column align-items-center justify-content-start">
              <h4 className="header-text-light mb-0">Bem vindo, <span id="username">Vitor Manoel Bitencourt Araújo</span></h4>
              <h6 className="header-text-light"><span id="role">Admin Primário</span> | <span id="empresa">Cartão de TODOS - Nova Iguaçu</span></h6>
            </div>

            <div className="d-flex flex-row align-items-center gap-2">
              <button type="button" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Mudar Tema" className="btn btn-2-light toggle-light" onClick={() => toggleTheme()}>
                <i className="bi bi-sun"></i>
              </button>
              <button type="button" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Sair" className="btn btn-2-light toggle-light">
                <i className="bi bi-door-open"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="main-light pe-3 pb-3" style={{ flexGrow: 1 }} id="main">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Painel;