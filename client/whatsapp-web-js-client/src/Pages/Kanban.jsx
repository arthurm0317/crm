import React, { useState, useRef, useEffect } from 'react';

// Mock inicial de funis, etapas e leads
const mockFunis = [
  {
    id: 1,
    nome: 'Vendas',
    etapas: [
      { id: 1, nome: 'Novos Clientes' },
      { id: 2, nome: 'Proposta Enviada' },
      { id: 3, nome: 'Negociação' },
      { id: 4, nome: 'Aguardando Retorno' },
      { id: 5, nome: 'Clientes Fechados' },
      { id: 6, nome: 'Pós-venda' },
      { id: 7, nome: 'Perdidos' }
    ],
    contatosVinculados: ['+5511999999999'],
  },
  {
    id: 2,
    nome: 'Adimplência',
    etapas: [
      { id: 8, nome: 'Cobrança 1' },
      { id: 9, nome: 'Cobrança 2' },
      { id: 10, nome: 'Pago' }
    ],
    contatosVinculados: ['+5511988888888'],
  }
];

const mockLeads = [
  { id: 1, nome: 'João Silva', funilId: 1, etapaId: 1, tags: ['VIP', 'Novo'], telefone: '+5511999999999' },
  { id: 2, nome: 'Maria Souza', funilId: 1, etapaId: 2, tags: ['Retorno'], telefone: '+5511999999999' },
  { id: 3, nome: 'Empresa X', funilId: 2, etapaId: 4, tags: ['Cobrança'], telefone: '+5511988888888' }
];

function KanbanPage({ theme }) {
  const [funis, setFunis] = useState(mockFunis);
  const [leads, setLeads] = useState(mockLeads);
  const [funilSelecionado, setFunilSelecionado] = useState(mockFunis[0].id);

  // Drag and drop state
  const [draggedLead, setDraggedLead] = useState(null);

  // Drag-to-scroll state
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Adiciona/remover listeners globais para mousemove/mouseup
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
      const walk = x - startX;
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft - walk;
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  const handleMouseDown = (e) => {
    // Só ativa se clicar no container, não em um card
    if (e.button !== 0) return;
    if (e.target.closest('.kanban-card')) return;
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const funilAtual = funis.find(f => f.id === funilSelecionado);
  const etapas = funilAtual.etapas;

  // CRUD de etapas e tags: placeholders para modais ou menus
  const handleAddEtapa = () => alert('Adicionar etapa (CRUD)');
  const handleEditEtapa = (etapa) => alert(`Editar etapa: ${etapa.nome}`);
  const handleDeleteEtapa = (etapa) => alert(`Excluir etapa: ${etapa.nome}`);
  const handleManageTags = (lead) => alert(`Gerenciar tags de ${lead.nome}`);

  // Drag and drop handlers
  const onDragStart = (lead) => setDraggedLead(lead);
  const onDrop = (etapaId) => {
    if (draggedLead) {
      setLeads(leads.map(l => l.id === draggedLead.id ? { ...l, etapaId } : l));
      setDraggedLead(null);
    }
  };

  return (
    <div className={`main-kanban bg-form-${theme} p-3 h-100 w-100`} style={{ minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Seletor de Funil */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <h4 className={`header-text-${theme} mb-0`}>{funilAtual.nome}</h4>
        <div className="d-flex gap-2 align-items-center">
          <select
            className={`form-select input-${theme}`}
            style={{ width: 220 }}
            value={funilSelecionado}
            onChange={e => setFunilSelecionado(Number(e.target.value))}
          >
            {funis.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
          <button className={`btn btn-1-${theme}`} onClick={() => alert('Adicionar Funil (CRUD)')}><i className="bi bi-plus-lg me-2"></i>Novo Funil</button>
          <button className={`btn btn-1-${theme}`} onClick={handleAddEtapa}><i className="bi bi-plus-lg me-2"></i>Nova Etapa</button>
        </div>
      </div>

      {/* Contatos vinculados ao funil */}
      <div className="mb-3">
        <span className={`card-subtitle-${theme}`}>Contatos WhatsApp vinculados: </span>
        {funilAtual.contatosVinculados.map((num, i) => (
          <span key={num} className="badge bg-success me-2">{num}</span>
        ))}
        <button className={`btn btn-2-${theme} btn-sm ms-2`} onClick={() => alert('Vincular contato WhatsApp ao funil')}>Vincular Contato</button>
      </div>

      {/* Colunas do Kanban (etapas) */}
      <div style={{ width: '100%', height: 500 }}>
        <div
          className="kanban-scroll-container"
          ref={scrollRef}
          style={{
            overflowX: 'auto',
            height: '100%',
            border: `1px solid var(--border-color-${theme})`,
            padding: '12px',
            borderRadius: '0.375rem',
            background: 'inherit'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="d-flex flex-row gap-4"
            style={{ minHeight: 0, minWidth: '100%', width: 'max-content' }}>
            {etapas.map(etapa => (
              <div key={etapa.id} className={`kanban-col card-${theme} border border-${theme} rounded p-2`} style={{ minWidth: 300, maxWidth: 300 }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(etapa.id)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className={`mb-0 header-text-${theme}`}>{etapa.nome}</h6>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-2-light" title="Editar etapa" onClick={() => handleEditEtapa(etapa)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm delete-btn" title="Excluir etapa" onClick={() => handleDeleteEtapa(etapa)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
                {/* Cards de leads nesta etapa */}
                {leads.filter(l => l.funilId === funilSelecionado && l.etapaId === etapa.id).map(lead => (
                  <div
                    key={lead.id}
                    className={`kanban-card card-${theme} border border-${theme} mb-2 p-2`}
                    draggable
                    onDragStart={() => onDragStart(lead)}
                    style={{ cursor: 'auto' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`fw-bold header-text-${theme}`}>{lead.nome}</span>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-2-light" title="Gerenciar tags" onClick={() => handleManageTags(lead)} style={{cursor: 'pointer'}}><i className="bi bi-tags"></i></button>
                        <button className="btn btn-sm btn-2-light" title="Alterar funil" onClick={() => alert('Alterar funil do lead')} style={{cursor: 'pointer'}}><i className="bi bi-kanban"></i></button>
                        <button className="btn btn-sm btn-2-light" title="Abrir chat" style={{cursor: 'pointer'}}><i className="bi bi-chat-dots"></i></button>
                      </div>
                    </div>
                    <div className="mt-1">
                      {lead.tags.map(tag => (
                        <span key={tag} className="badge bg-primary me-1">{tag}</span>
                      ))}
                    </div>
                    <div className={`mt-1 small header-text-${theme}`}>{lead.telefone}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KanbanPage;
