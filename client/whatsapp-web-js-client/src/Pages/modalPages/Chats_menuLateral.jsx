import React from 'react';
import favicon from '../assets/favicon_25.png';

const ChatsMenuLateral = ({ theme, onClose, style = {} }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '350px',
        height: '100%',
        background: 'var(--bg-color-' + theme + ')',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        transition: 'opacity 0.3s, transform 0.3s',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24, margin: '16px 24px 0' }}>
        <img src={favicon} alt="Logo" style={{ height: '100%', width: 'auto' }} />
        <button
          className={`btn btn-2-${theme}`}
          onClick={onClose}
          style={{
            padding: 0,
            width: 28,
            height: 28,
            minWidth: 28,
            minHeight: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            border: 'none'
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
            <h5 style={{ marginBottom: 16 }}>Informações do Contato</h5>
            <div style={{ marginBottom: 16 }}>
            <strong>Nome do Cliente:</strong>
            <div>João da Silva</div>
            </div>
            <div style={{ marginBottom: 16 }}>
            <strong>Número:</strong>
            <div>+55 11 91234-5678</div>
            </div>
            <div style={{ marginBottom: 16 }}>
            <strong>Última mensagem:</strong>
            <div>12/06/2024 14:32</div>
            </div>
            <div style={{ marginBottom: 16 }}>
            <strong>Kanban:</strong>
            <div>Funil: Vendas</div>
            <div>Coluna: Prospecção</div>
            </div>
            <div style={{ marginBottom: 16 }}>
            <strong>Responsável:</strong>
            <div>Time: Comercial</div>
            <div>Usuário: Maria Oliveira</div>
            </div>
        </div>
        <div className='d-flex justify-content-center flex-column align-items-center w-100'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%'}}>
            <button className={`btn btn-2-${theme}`}>Agendar Templates</button>
            <button className={`btn btn-2-${theme}`}>Trocar Tags</button>
            <button className={`btn btn-2-${theme}`}>Trocar Kanban</button>
            <button className={`btn btn-2-${theme}`}>Informações Adicionais</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsMenuLateral;
