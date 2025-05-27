import React, { useState, useRef, useEffect } from 'react';
import NovoFunilModal from './modalPages/Kanban_novoFunil';
import GerirEtapaModal from './modalPages/Kanban_gerirEtapa';

// Mock inicial de funis, etapas e leads
const mockFunis = [
    {
        id: 1,
        nome: 'Vendas',
        etapas: [
        { id: 1, nome: 'Novos Clientes', cor: '#ff0000' }, // Exemplo de cor
        { id: 2, nome: 'Proposta Enviada', cor: '#0000ff' },
        { id: 3, nome: 'Negociação', cor: '#008000' },
        { id: 4, nome: 'Aguardando Retorno', cor: '#7fffd4' },
        { id: 5, nome: 'Clientes Fechados', cor: '#2ecc71' },
        { id: 6, nome: 'Pós-venda', cor: '#1abc9c' },
        { id: 7, nome: 'Perdidos', cor: '#e74c3c' }
        ],
        contatosVinculados: ['+5511999999999', '+5511988888888', '+5511977777777'],
        usuariosVinculados: [
            { id: 1, nome: 'Arthur FilhoDeCauan' },
            { id: 2, nome: 'Cauan FilhoDeArthur' }
          ],
        filasVinculadas: [
            { id: 1, nome: 'Fila 1' },
            { id: 2, nome: 'Fila 2' }
        ]
    },
    {
        id: 2,
        nome: 'Adimplência',
        etapas: [
        { id: 8, nome: 'Cobrança 1', cor: '#e67e22' },
        { id: 9, nome: 'Cobrança 2', cor: '#f1c40f' },
        { id: 10, nome: 'Pago', cor: '#2ecc71' }
        ],
        contatosVinculados: ['+5511966666666'],
        usuariosVinculados: [
            { id: 1, nome: 'Vitor FilhoDeChocadeira' },
          ],
        filasVinculadas: [
            { id: 3, nome: 'Fila 3' }
        ]
    }
];

const mockLeads = [
  { id: 1, nome: 'João Silva', funilId: 1, etapaId: 1, tags: ['VIP', 'Novo'], telefone: '+5511999999999' },
  { id: 2, nome: 'Maria Souza', funilId: 1, etapaId: 2, tags: ['Retorno'], telefone: '+5511999999999' },
  { id: 3, nome: 'Empresa X', funilId: 2, etapaId: 4, tags: ['Cobrança'], telefone: '+5511988888888' }
];

function maskPhone(num) {
  // Remove tudo que não for dígito
  const digits = num.replace(/\D/g, '');
  // Aplica a máscara
  return digits.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
}

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

  const funilAtual = funis.find(f => f.id === funilSelecionado) || { etapas: [], contatosVinculados: [], filasVinculadas: [] };
  const etapas = funilAtual.etapas;

  // CRUD de etapas e tags: placeholders para modais ou menus
  const handleAddEtapa = () => setShowGerirEtapaModal(true);
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

  const [showNovoFunilModal, setShowNovoFunilModal] = useState(false);
  const [showGerirEtapaModal, setShowGerirEtapaModal] = useState(false);

  // Salvar novo funil
  const handleSalvarNovoFunil = ({ titulo, etapas }) => {
    const novoId = funis.length > 0 ? Math.max(...funis.map(f => f.id)) + 1 : 1;
    const novoFunil = {
      id: novoId,
      nome: titulo,
      etapas: etapas.map((etapa, idx) => ({
        id: novoId * 100 + idx + 1, // Garante id único
        nome: etapa.nome,
        cor: etapa.cor
      })),
      contatosVinculados: [],
      usuariosVinculados: [],
      filasVinculadas: []
    };
    setFunis([...funis, novoFunil]);
    setFunilSelecionado(novoId);
  };

  // Salvar etapas do funil
  const handleSalvarEtapas = (novasEtapas) => {
    setFunis(funis.map(f =>
      f.id === funilSelecionado
        ? { ...f, etapas: novasEtapas.map((etapa, idx) => ({
            ...etapa,
            id: f.etapas[idx]?.id || (f.id * 100 + idx + 1)
          })) }
        : f
    ));
  };

  return (
    <div className={`main-kanban bg-form-${theme} p-3 h-100 w-100`} style={{ minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Seletor de Funil */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <h2 className={`header-text-${theme} mb-0 ms-3`}>{funilAtual.nome}</h2>

        <div className="d-flex gap-2 align-items-center">
            <div className="input-group">
                <span className={`input-group-text igt-${theme}`}>
                    <i className="bi bi-funnel-fill"></i>
                </span>
                <select
                className={`form-select input-${theme}`}
                style={{ width: 150 }}
                value={funilSelecionado}
                onChange={e => setFunilSelecionado(Number(e.target.value))}
                >
                {funis.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
                </select>
            </div>

            <button className={`btn btn-1-${theme}`} style={{ minWidth: 140 }} onClick={() => setShowNovoFunilModal(true)}>
                <i className="bi bi-funnel me-2"></i>Novo Funil
            </button>
            
            <button className={`btn btn-1-${theme}`} style={{ minWidth: 140 }} onClick={handleAddEtapa}>
                <i className="bi bi-layout-sidebar-inset me-2"></i>Gerir Etapas
            </button>

        </div>
      </div>

      {/* Vinculações */}
      <div id="vinculados" className="w-100">
        <div className={`px-3 mb-3 card-${theme} d-flex flex-row align-items-center justify-content-between`}
          style={{ 
            overflowX: 'auto', whiteSpace: 'nowrap',
            borderRadius: '0.375rem', 
            padding: '6px',
            border: `1px solid var(--border-color-${theme})`
          }}>
          
          {/* Contatos */}
          <div className="d-flex flex-row align-items-center">
            <span className={`card-subtitle-${theme} me-2`}>
              <i className="bi bi-whatsapp me-2"></i> Contatos 
            </span>
            {(funilAtual.contatosVinculados || []).map((num, i) => (
              <span key={num} className="badge bg-primary me-2">{maskPhone(num)}</span>
            ))}
          </div>

          {/* Divider Vertical entre Contatos e Filas */}
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: `var(--border-color-${theme})`,
            margin: '0 10px'
          }}></div>

          {/* Filas */}
          <div className="d-flex flex-row align-items-center">
            <span className={`card-subtitle-${theme} me-2`}>
              <i className="bi bi-diagram-3 me-2"></i> Filas
            </span>
            {(funilAtual.filasVinculadas || []).map((fila) => (
              <span key={fila.id} className="badge bg-secondary me-2">{fila.nome}</span>
            ))}
          </div>

          {/* Divider Vertical entre Filas e Usuários */}
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: `var(--border-color-${theme})`,
            margin: '0 10px'
          }}></div>

          {/* Usuários */}
          <div className="d-flex flex-row align-items-center">
            <span className={`card-subtitle-${theme} me-2`}>
              <i className="bi bi-people me-2"></i> Usuários 
            </span>
            {(funilAtual.usuariosVinculados || []).map((usuario) => (
              <span key={usuario.id} className="badge bg-secondary me-2">{usuario.nome}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Colunas do Kanban (etapas) */}
      <div style={{ width: '100%', height: '100%' }}>
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
            {(funilAtual.etapas || []).map(etapa => (
              <div key={etapa.id} className={`kanban-col card-${theme} border border-${theme} rounded p-2`} style={{ minWidth: 300, maxWidth: 300 }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(etapa.id)}
              >
                <div className="d-flex flex-column mb-2 mx-2">
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: `${etapa.cor}`,
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}
                  />
                  <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                    <h6 className={`mb-0 header-text-${theme}`}>{etapa.nome}</h6>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-2-light" title="Editar etapa" onClick={() => handleEditEtapa(etapa)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm delete-btn" title="Excluir etapa" onClick={() => handleDeleteEtapa(etapa)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Renderizando os leads filtrados */}
                  {(leads.filter(lead => lead.funilId === funilSelecionado && lead.etapaId === etapa.id) || []).map(lead => (
                    <div key={lead.id} className={`kanban-card card-${theme} border border-${theme} mb-2 py-2 px-3`}
                      draggable
                      onDragStart={() => onDragStart(lead)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`fw-bold header-text-${theme}`}>{lead.nome}</span>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-2-light" title="Gerenciar tags" onClick={() => handleManageTags(lead)} style={{ cursor: 'pointer' }}>
                            <i className="bi bi-tags"></i>
                          </button>
                          <button className="btn btn-sm btn-2-light" title="Alterar funil" onClick={() => alert('Alterar funil do lead')} style={{ cursor: 'pointer' }}>
                            <i className="bi bi-funnel-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-2-light" title="Abrir chat" style={{ cursor: 'pointer' }}>
                            <i className="bi bi-chat-dots"></i>
                          </button>
                        </div>
                      </div>
                      <div className={`mt-1 small header-text-${theme}`}>{maskPhone(lead.telefone)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Novo Funil */}
      <NovoFunilModal
        theme={theme}
        show={showNovoFunilModal}
        onHide={() => setShowNovoFunilModal(false)}
        onSave={handleSalvarNovoFunil}
      />
      {/* Modal de Gerir Etapas */}
      <GerirEtapaModal
        theme={theme}
        show={showGerirEtapaModal}
        onHide={() => setShowGerirEtapaModal(false)}
        onSave={handleSalvarEtapas}
        funil={funilAtual}
        etapas={etapas}
      />

    </div>
  );
}

export default KanbanPage;