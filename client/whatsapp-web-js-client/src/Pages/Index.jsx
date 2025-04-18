import * as bootstrap from 'bootstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importando o CSS do Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Importando o JS do Bootstrap
import shortlogo from './assets/favicon.png'; // Importando o logo
import logo from './assets/effective-gain_logo.png'; // Importando o logo

import './assets/style.css'; // Seu CSS customizado
import { useTheme } from './assets/js/useTheme'; // Seu hook de tema
import { useNavigate } from 'react-router-dom'; // Navegação

import Dashboard from './Dashboard';
import ChatPage from './Chats';
import AgendaPage from './Lembretes';
import RelatorioPage from './Relatorios';
import UsuariosPage from './Usuarios';

function Painel() {

  const username = 'Vitor Manoel Bitencourt Araújo';
  const role = 'Admin Primário';
  const empresa = 'Cartão de TODOS - Nova Iguaçu';

  const [theme, setTheme] = useTheme();
  const [page, setPage] = useState('dashboard');
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
    document.cookie = `theme=${newTheme}`;
    setTheme(newTheme);
  };
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
      const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
  
      return () => tooltipList.forEach(t => t.dispose()); // Limpa os tooltips ao desmontar
    }
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard theme={theme} />;
      case 'chats': return <ChatPage theme={theme} />;
      case 'usuarios': return <UsuariosPage theme={theme} />;
      case 'agenda': return <AgendaPage theme={theme} />;
      case 'relatorios': return <RelatorioPage theme={theme} />;
      default: return <Dashboard theme={theme} />;
    }
  };
  
  return (
    <div className={`bg-screen-${theme}`} style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="d-flex h-100">
        {/* Sidebar */}
        <div id="sidebar" className={`bg-form-${theme} h-100 sidebar ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div id="sidebar-top" style={{ height: '10%', width: '100%' }} className="p-2 d-flex flex-row align-items-center justify-content-evenly">
            <img src={isSidebarExpanded ? logo : shortlogo} alt="Logo" className="img-fluid" style={{ height: 'auto', width: isSidebarExpanded ? '80%' : '65%' }} />
          </div>
          <div style={{ flexGrow: 1, width: '100%' }} id="sidebar-body" className="d-flex flex-column align-items-center justify-content-start my-5 gap-3">
            <button
              id="dashboard"
              onClick={() => setPage('dashboard')}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title="Dashboard"
              className={`btn ${page === 'dashboard' ? `btn-1-${theme}` : `btn-2-${theme}`} d-flex flex-row align-items-center justify-content-start gap-2`}
            >
              <i className="bi bi-speedometer2"></i>
              <span className="sidebar-label d-none">Dashboard</span>
            </button>
            <button
              id="chats"
              onClick={() => setPage('chats')}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title="Chats"
              className={`btn ${page === 'chats' ? `btn-1-${theme}` : `btn-2-${theme}`} d-flex flex-row align-items-center justify-content-start gap-2`}
            >
              <i className="bi bi-chat-dots"></i>
              <span className="sidebar-label d-none">Chats</span>
            </button>
            <button
              id="usuarios"
              onClick={() => setPage('usuarios')}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title="Usuários"
              className={`btn ${page === 'usuarios' ? `btn-1-${theme}` : `btn-2-${theme}`} d-flex flex-row align-items-center justify-content-start gap-2`}
            >
              <i className="bi bi-people"></i>
              <span className="sidebar-label d-none">Usuários</span>
            </button>
            <button
              id="lembretes"
              onClick={() => setPage('agenda')}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title="Lembretes"
              className={`btn ${page === 'agenda' ? `btn-1-${theme}` : `btn-2-${theme}`} d-flex flex-row align-items-center justify-content-start gap-2`}
            >
              <i className="bi bi-bell"></i>
              <span className="sidebar-label d-none">Lembretes</span>
            </button>
            <button
              id="relatorios"
              onClick={() => setPage('relatorios')}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title="Relatórios"
              className={`btn ${page === 'relatorios' ? `btn-1-${theme}` : `btn-2-${theme}`} d-flex flex-row align-items-center justify-content-start gap-2`}
            >
              <i className="bi bi-bar-chart-line"></i>
              <span className="sidebar-label d-none">Relatórios</span>
            </button>
          </div>        
        </div>

        {/* Conteúdo principal */}
        <div className="d-flex flex-column flex-grow-1">
          {/* Header */}
          <div className={`header-${theme} ps-1 pe-4 d-flex align-items-center justify-content-between`} style={{ height: '10%' }}>
            <button data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Expandir/Retrair" id="toggleSidebar" className={`btn btn-3-${theme} p-1`} onClick={toggleSidebar}>
              <i className={`bi ${isSidebarExpanded ? 'bi-arrow-bar-left' : 'bi-arrow-bar-right'}`}></i>
            </button>
            <div id="header-title" className="d-flex flex-column align-items-center justify-content-start">
              <h4 className={`header-text-${theme} mb-0`}>Bem vindo, <span id="username">{username}</span></h4>
              <h6 className={`header-text-${theme}`}><span id="role">{role}</span> | <span id="empresa">{empresa}</span></h6>
            </div>
            <div className="d-flex flex-row align-items-center gap-2">
              <button type="button" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Mudar Tema" className={`btn btn-2-${theme} toggle-${theme}`} onClick={toggleTheme}>
                <i className="bi bi-sun"></i>
              </button>
              <button type="button" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Sair" className={`btn btn-2-${theme} toggle-${theme}`}>
                <i className="bi bi-door-open"></i>
              </button>
            </div>
          </div>

          {/* Main */}
          <div className={`main-${theme} pe-3 pb-3`} style={{ flexGrow: 1 }} id="main">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Painel;