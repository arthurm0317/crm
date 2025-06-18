import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NovoFunilModal from './modalPages/Kanban_novoFunil';
import GerirEtapaModal from './modalPages/Kanban_gerirEtapa';
import { Dropdown } from 'react-bootstrap';
import KanbanExcluirEtapaModal from './modalPages/Kanban_excluirEtapa';
import axios from 'axios';
import { socket } from '../socket';
import ChatPage from './Chats';
import ImportarContatosModal from './modalPages/Kanban_importarContatos';
import { Menu } from '@headlessui/react';

const styles = `
  .dropdown-toggle::after {
    display: none !important;
  }
  
  .dropdown-menu {
    margin-top: 0 !important;
  }

  /* Ajuste para garantir que o dropdown não seja cortado */
  .kanban-col {
    overflow: visible !important;
  }

  .kanban-card {
    overflow: visible !important;
  }

  /* Container do dropdown para posicionamento correto */
  .dropdown {
    position: static !important;
  }

  /* Ajuste para o dropdown aparecer corretamente */
  .dropdown-menu.show {
    display: block;
    position: absolute;
    inset: auto !important;
    transform: none !important;
    margin-top: 0.125rem;
    margin-left: 0;
  }

  /* Ajuste específico para o dropdown de tags */
  .dropdown-menu.show[data-popper-placement="bottom-start"] {
    top: 100% !important;
    left: 0 !important;
  }

  /* Garantir que o dropdown fique visível */
  .dropdown-menu {
    z-index: 9999 !important;
    transition: all 0.25s ease-in-out !important;
  }

  /* Ajuste para a animação do dropdown */
  .dropdown-menu.show {
    opacity: 1;
    transform: translateY(0);
  }

  .dropdown-menu:not(.show) {
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
  }

  /* Ajuste para o posicionamento do dropdown */
  .headlessui-menu-items {
    position: fixed !important;
    transform: none !important;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function maskPhone(num) {
  // Remove tudo que não for dígito
  const digits = num.replace(/\D/g, '');
  // Aplica a máscara
  return digits.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
}

function DropdownPortal({ children, buttonRef, isOpen }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
    } else {
      const timer = setTimeout(() => setMounted(false), 250); // Aguarda a transição terminar
      return () => clearTimeout(timer);
    }
  }, [isOpen, buttonRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999
      }}
    >
      {children}
    </div>,
    document.body
  );
}

function DropdownButton({ icon, children, theme }) {
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu as="div" className="position-relative">
      {({ open }) => {
        setIsOpen(open);
        return (
          <>
            <Menu.Button
              ref={buttonRef}
              className={`btn btn-sm btn-2-light`}
              style={{ 
                padding: 6, 
                minWidth: 35, 
                minHeight: 35
              }}
            >
              <i className={`bi bi-${icon}`}></i>
            </Menu.Button>

            <DropdownPortal buttonRef={buttonRef} isOpen={open}>
              <Menu.Items
                className={`dropdown-menu show input-${theme}`}
                style={{
                  minWidth: '200px',
                  marginTop: '0.125rem'
                }}
              >
                {children}
              </Menu.Items>
            </DropdownPortal>
          </>
        );
      }}
    </Menu>
  );
}

function KanbanPage({ theme }) {
  const [funis, setFunis] = useState([]);
  const [leads, setLeads] = useState([]);
  const [funilSelecionado, setFunilSelecionado] = useState('');
  const [editingEtapaId, setEditingEtapaId] = useState(null);
  const [editingEtapaNome, setEditingEtapaNome] = useState('');
  const [etapas, setEtapas] = useState([])
  const [draggedLead, setDraggedLead] = useState(null);
  const [cards, setCards] = useState([])
  const [allTags, setAllTags] = useState([]);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  const url = process.env.REACT_APP_URL;
  const [socketInstance] = useState(socket)
  const [leadSelecionado, setLeadSelecionado] = useState(null);
  const [showImportarContatosModal, setShowImportarContatosModal] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});
  const dropdownRefs = useRef({});

  useEffect(()=>{
    const fetchFunis = async () => {
    try {
      const response = await axios.get(`${url}/kanban/get-funis/${schema}`);
        setFunis(Array.isArray(response.data.name) ? response.data.name : []);
        console.log(response.data)
      } catch (error) {
        console.error('Erro ao buscar funis:', error);
      }
    };
    
    fetchFunis();
  }, [])

useEffect(() => {
  function handleTagUpdated({ chat_id, tag, checked }) {
    setLeads(leads => leads.map(l =>
      l.id === chat_id
        ? {
            ...l,
            tags: checked
              ? [...(l.tags || []), tag]
              : (l.tags || []).filter(t => t.id !== tag.id)
          }
        : l
    ));
  }
  socketInstance.on('tagUpdated', handleTagUpdated);
  console.log('tag updated')
  return () => {
    socketInstance.off('tagUpdated', handleTagUpdated);
  };
}, []);

  useEffect(() => {
    if (!funilSelecionado) {
      setEtapas([]);
      return;
    }
    const fetchEtapas = async () => {
      try {
        const response = await axios.get(`${url}/kanban/get-stages/${funilSelecionado.charAt(0).toLowerCase() + funilSelecionado.slice(1)}/${schema}`);
        setEtapas(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEtapas();
  }, [funilSelecionado, schema]);

  useEffect(()=>{
    const fetchCards = async()=>{
    try {
        const response = await axios.get(`${url}/kanban/get-cards/${funilSelecionado}/${schema}`)
        setCards(Array.isArray(response.data)?response.data:[response.data])
        console.log(response.data)
      }catch (error) {
      console.error(error)
    } 
  }
  fetchCards()
  }, [funilSelecionado])
 
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

  // CRUD de etapas e tags: placeholders para modais ou menus
  const handleAddEtapa = () => setShowGerirEtapaModal(true);
  const handleEditEtapa = (etapa) => {
    setEditingEtapaId(etapa.id);
    setEditingEtapaNome(etapa.etapa);
  };
  const handleSaveEditEtapa = async(etapa) => {
    setFunis(funis => funis.map(f =>
      f.id === funilSelecionado
        ? { ...f, etapas: f.etapas.map(e =>
            e.id === etapa.id ? { ...e, name: editingEtapaNome } : e
          ) }
        : f
    ));
    const response = await axios.put(`${url}/kanban/update-stage-name`,{
      etapa_id:editingEtapaId,
      etapa_nome:editingEtapaNome,
      sector: funilSelecionado,
      schema: schema
    })

     setEtapas(etapas =>
    etapas.map(e =>
      e.id === etapa.id ? { ...e, etapa: editingEtapaNome } : e
    )
  );

    
    setEditingEtapaId(null);
    setEditingEtapaNome('');
  };
  const [showExcluirEtapaModal, setShowExcluirEtapaModal] = useState(false);
  const [etapaParaExcluir, setEtapaParaExcluir] = useState(null);

  const handleDeleteEtapa = (etapa) => {
    setEtapaParaExcluir(etapa);
    setShowExcluirEtapaModal(true);
  };

  const handleConfirmarExcluirEtapa = () => {
    setFunis(funis => funis.map(f =>
      f.id === funilSelecionado
        ? { ...f, etapas: f.etapas.filter(e => e.id !== etapaParaExcluir.id) }
        : f
    ));
    setShowExcluirEtapaModal(false);
    setEtapaParaExcluir(null);
  };

  const handleManageTags = (lead) => alert(`Gerenciar tags de ${lead.nome}`);

  // Drag and drop handlers
  const onDragStart = (lead) => setDraggedLead(lead);
  const onDrop = async(etapaId) => {
   if (draggedLead) {
    setCards(cards =>
      cards.map(l =>
        l.id === draggedLead.id ? { ...l, etapa_id: etapaId } : l
      )
    );
    setDraggedLead(null);
    try {
      const respose = await axios.put(`${url}/kanban/change-stage`,{
        chat_id: draggedLead.id,
        stage_id: etapaId,
        schema: schema
      })
      
      socketInstance.emit('leadMoved',{
        chat_id: draggedLead.id,
        stage_id: etapaId,
        schema: schema
      })
      
    } catch (error) {
      console.error(error)
    }
  }
  };
  useEffect(() => {
function handleLeadMoved({ chat_id, etapa_id, stage_id }) {
  const novoEtapaId = etapa_id || stage_id;
  setCards(cards =>
    cards.map(l =>
      l.id === chat_id ? { ...l, etapa_id: novoEtapaId } : l
    )
  );
}
  socketInstance.on('leadMoved', handleLeadMoved);
  return () => {
    socketInstance.off('leadMoved', handleLeadMoved);
  };
}, []);

  const [showNovoFunilModal, setShowNovoFunilModal] = useState(false);
  const [showGerirEtapaModal, setShowGerirEtapaModal] = useState(false);

  useEffect(() => {
}, [funilSelecionado]);
  // Salvar novo funil
  const handleSalvarNovoFunil = ({ titulo, etapas }) => {
    const novoId = funis.length > 0 ? Math.max(...funis.map(f => f.id)) + 1 : 1;
    const novoFunil = {
      id: novoId,
      nome: titulo,
      etapas: etapas.map((etapa, idx) => ({
        id: novoId * 100 + idx + 1, // Garante id único
        nome: etapa.etapa,
        cor: etapa.color
      })),
      contatosVinculados: [],
      usuariosVinculados: [],
      filasVinculadas: []
    };
    setFunis([...funis, novoFunil]);
    setFunilSelecionado(novoId);
  };
useEffect(() => {
  if (funis.length > 0 && !funilSelecionado) {
    setFunilSelecionado(funis[0]);
  }
}, [funis, funilSelecionado]);

  // Salvar etapas do funil
  const handleSalvarEtapas = (novasEtapas) => {
    // Atualiza o estado funis
    setFunis(funis.map(f =>
      f.id === funilSelecionado
        ? { ...f, etapas: novasEtapas.map((etapa, idx) => ({
            ...etapa,
            id: f.etapas[idx]?.id || (f.id * 100 + idx + 1)
          })) }
        : f
    ));
    
    // Atualiza o estado etapas para refletir as mudanças imediatamente
    setEtapas(novasEtapas.map((etapa, idx) => ({
      ...etapa,
      id: etapa.id || (Date.now() + idx), // Usa timestamp + índice para garantir ID único
      etapa: etapa.nome || etapa.etapa, // Garante que o nome seja salvo em etapa.etapa
      color: etapa.cor || etapa.color,
      pos: etapa.index || idx
    })));
  };

  // Add this useEffect to fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTagsResp = await axios.get(`${url}/tag/${schema}`);
        setAllTags(Array.isArray(allTagsResp.data) ? allTagsResp.data : [allTagsResp.data]);
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      }
    };
    fetchTags();
  }, [schema, url]);

  const renderPage = () => {
  if (!leadSelecionado) return null;
  return <ChatPage theme={theme} chat_id={leadSelecionado.id} />;
};

  const handleDropdownToggle = useCallback((id, isOpen) => {
    setDropdownStates(prev => ({ ...prev, [id]: isOpen }));
    
    if (isOpen) {
      // Ajusta a posição do dropdown quando ele é aberto
      setTimeout(() => {
        const button = dropdownRefs.current[`button-${id}`];
        const menu = dropdownRefs.current[`menu-${id}`];
        if (button && menu) {
          const buttonRect = button.getBoundingClientRect();
          const menuRect = menu.getBoundingClientRect();
          const containerRect = button.closest('.kanban-col').getBoundingClientRect();
          
          // Calcula a posição ideal
          let top = buttonRect.bottom;
          let left = buttonRect.left;
          
          // Ajusta se o dropdown ultrapassar a borda direita
          if (left + menuRect.width > containerRect.right) {
            left = containerRect.right - menuRect.width;
          }
          
          // Ajusta se o dropdown ultrapassar a borda inferior
          if (top + menuRect.height > window.innerHeight) {
            top = buttonRect.top - menuRect.height;
          }
          
          // Aplica a posição
          menu.style.position = 'fixed';
          menu.style.top = `${top + window.scrollY}px`;
          menu.style.left = `${left + window.scrollX}px`;
        }
      }, 0);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = Object.keys(dropdownStates);
      const clickedInsideDropdown = dropdowns.some(id => {
        const button = dropdownRefs.current[`button-${id}`];
        const menu = dropdownRefs.current[`menu-${id}`];
        return button?.contains(event.target) || menu?.contains(event.target);
      });

      if (!clickedInsideDropdown) {
        setDropdownStates({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownStates]);

  return leadSelecionado ? (
    renderPage()
  ) :(
    <div className={`main-kanban bg-form-${theme} px-1 pt-3 h-100 w-100`} style={{ minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Seletor de Funil */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

        <div className={`d-flex flex-row align-items-center mb-0 ms-3 header-text-${theme} gap-2`}>
          <h2 style={{ color: 'var(--placeholder-color)', fontWeight: 400 }}>Kanban</h2>
          <h2 style={{ fontWeight: 400 }}>
  {funilSelecionado
    ? funilSelecionado.charAt(0).toUpperCase() + funilSelecionado.slice(1)
    : ''}
</h2>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
            <div className="input-group">
                <span className={`input-group-text igt-${theme}`}>
                    <i className="bi bi-funnel-fill"></i>
                </span>
                <select
  className={`form-select input-${theme}`}
  style={{ width: 150 }}
  value={funilSelecionado}
   onChange={e => {
    setFunilSelecionado(e.target.value);
    console.log('funilSelecionado:', e.target.value);
  }}
>
  {funis.map(nome => (
    <option key={nome} value={nome}>
      {nome.charAt(0).toUpperCase() + nome.slice(1)}
    </option>
  ))}
</select>
            </div>

            <button className={`btn btn-1-${theme}`} style={{ minWidth: 140 }} onClick={() => setShowNovoFunilModal(true)}>
                <i className="bi bi-funnel me-2"></i>Novo Funil
            </button>
            
            <button className={`btn btn-1-${theme}`} style={{ minWidth: 140 }} onClick={handleAddEtapa}>
                <i className="bi bi-layout-sidebar-inset me-2"></i>Gerir Etapas
            </button>

            <button className={`btn btn-2-${theme}`} style={{ minWidth: 180 }} onClick={() => setShowImportarContatosModal(true)}>
                <i className="bi bi-file-earmark-arrow-up me-2"></i>Importar Contatos
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
            {etapas.map(etapa => {
              const etapaTemLeads = leads.some(lead => lead.funilId === funilSelecionado && lead.etapaId === etapa.id);
              return   (
                <div key={etapa.id} className={`kanban-col card-${theme} border border-${theme} rounded px-2 pt-2`} 
                  style={{ 
                    minWidth: 300, 
                    maxWidth: 300,
                    height: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(etapa.id)}
                >
                  <div className="d-flex flex-column mb-2 mx-2">
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: `${etapa.color}`,
                        borderRadius: '4px',
                      }}
                    />
                    <div className="d-flex flex-row justify-content-between align-items-center my-2">
                      {editingEtapaId === etapa.id ? (
                        <input
                          className={`form-control input-${theme} mb-0`}
                          style={{ maxWidth: 160, fontWeight: 600, fontSize: '1rem', lineHeight: '1.2', height: 'auto', padding: '2px 8px' }}
                          value={editingEtapaNome}
                          autoFocus
                          onChange={e => setEditingEtapaNome(e.target.value)}
                          onBlur={() => handleSaveEditEtapa(etapa)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveEditEtapa(etapa); }}
                        />
                      ) : (
                        <h6 className={`mb-0 header-text-${theme}`} style={{ fontWeight: 600 }}>{etapa.etapa}</h6>
                      )}
                      <div className="d-flex gap-1">
                        <button
                          className={`btn btn-sm btn-2-${theme} ${editingEtapaId === etapa.id ? 'disabled-btn' : ''}`}
                          title="Editar etapa"
                          onClick={() => handleEditEtapa(etapa)}
                          disabled={editingEtapaId === etapa.id}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-sm btn-2-${theme} delete-btn`}
                          title="Excluir etapa"
                          onClick={() => handleDeleteEtapa(etapa)}
                          disabled={etapaTemLeads}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    {/* Container para os leads com scroll */}
                    <div style={{ 
                      maxHeight: '580px', // Altura máxima para ~5 cards
                      overflowY: 'auto',
                    }}>
                      {/* Renderizando os leads filtrados */}
                      {(cards.filter(lead => lead.etapa_id === etapa.id) || []).map(lead => (
                        <div key={lead.id} className={`kanban-card card-${theme} border border-${theme} mb-2 py-2 px-3`}
                          draggable
                          onDragStart={() => onDragStart(lead)}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className={`fw-bold header-text-${theme} me-1`} style={{ fontSize: '0.8rem' }}>{lead.contact_name}</span>
                            <div className="d-flex gap-1">
                              {/* Dropdown de gerenciamento de tags */}
                              <DropdownButton icon="tags" theme={theme}>
                                <div>
                                  {allTags.map(tag => (
                                    <div
                                      key={tag.id}
                                      className={`dropdown-item dp-${theme} d-flex align-items-center gap-2`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`tag-${tag.id}`}
                                        checked={(lead.tags || []).some(t => t.id === tag.id)}
                                        onChange={async (e) => {
                                          try {
                                            if (e.target.checked) {
                                              await axios.post(`${url}/tag/add-tag`, {
                                                chat_id: lead.id,
                                                tag_id: tag.id,
                                                schema
                                              });
                                            } else {
                                              await axios.delete(`${url}/tag/remove-tag`, {
                                                data: {
                                                  chat_id: lead.id,
                                                  tag_id: tag.id,
                                                  schema
                                                }
                                              });
                                            }
                                            setCards(cards => cards.map(c =>
                                              c.id === lead.id
                                                ? {
                                                    ...c,
                                                    tags: e.target.checked
                                                      ? [...(c.tags || []), tag]
                                                      : (c.tags || []).filter(t => t.id !== tag.id)
                                                }
                                              : c
                                            ));
                                          } catch (error) {
                                            console.error('Erro ao atualizar tags:', error);
                                          }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                        onMouseDown={e => e.stopPropagation()}
                                      />
                                      <label
                                        htmlFor={`tag-${tag.id}`}
                                        className={`form-check-label card-subtitle-${theme} dp-${theme} mb-0`}
                                        style={{ cursor: 'pointer' }}
                                        onMouseDown={e => e.stopPropagation()}
                                      >
                                        {tag.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </DropdownButton>

                              {/* Dropdown de alterar funil */}
                              <DropdownButton icon="funnel-fill" theme={theme} style={{ backgroundColor: 'red' }}>
                                <div>
                                  <div className="dropdown-header" style={{ opacity: 1, color: 'var(--placeholder-color)' }}>
                                    Mover para...
                                  </div>
                                  {funis.filter(f => f !== funilSelecionado).length === 0 && (
                                    <Menu.Item disabled>
                                      <div className="dropdown-item disabled card-subtitle-light">
                                        Nenhum outro funil
                                      </div>
                                    </Menu.Item>
                                  )}
                                  {funis.filter(f => f !== funilSelecionado).map(funil => (
                                    <Menu.Item key={funil}>
                                      {({ active }) => (
                                        <div
                                          className={`dropdown-item dp-${theme} header-text-${theme} ${active ? 'active' : ''}`}
                                          onClick={async () => {
                                            try {
                                              await axios.put(`${url}/kanban/change-funil`, {
                                                chat_id: lead.id,
                                                funil: funil,
                                                schema
                                              });
                                              setCards(cards => cards.filter(c => c.id !== lead.id));
                                              socketInstance.emit('leadMoved', {
                                                chat_id: lead.id,
                                                funil: funil,
                                                schema
                                              });
                                            } catch (error) {
                                              console.error('Erro ao mudar funil:', error);
                                            }
                                          }}
                                        >
                                          {funil.charAt(0).toUpperCase() + funil.slice(1)}
                                        </div>
                                      )}
                                    </Menu.Item>
                                  ))}
                                </div>
                              </DropdownButton>

                              <button
                                className="btn btn-sm btn-2-light"
                                title="Abrir chat"
                                style={{ cursor: 'pointer', minWidth: 35, minHeight: 35 }}
                                onClick={() => setLeadSelecionado(lead)}
                              >
                                <i className="bi bi-chat-dots"></i>
                              </button>
                            </div>
                          </div>
                          {/* Exibir tags do lead */}
                          <div className="mt-1 mb-1 d-flex flex-wrap gap-1">
                            {(lead.tags || []).map(tag => (
                              <span key={tag.id} className="badge bg-secondary">{tag.name}</span>
                            ))}
                          </div>
                          <div className={`small header-text-${theme}`}>{maskPhone(lead.contact_phone)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
        funil={funilSelecionado}
        etapas={etapas}
      />
      {/* Modal de Excluir Etapa */}
      <KanbanExcluirEtapaModal
        show={showExcluirEtapaModal}
        onHide={() => setShowExcluirEtapaModal(false)}
        onConfirm={handleConfirmarExcluirEtapa}
        etapa={etapaParaExcluir}
        funil={funilSelecionado}
        theme={theme}
      />
      <ImportarContatosModal
        theme={theme}
        show={showImportarContatosModal}
        onHide={() => setShowImportarContatosModal(false)}
        funil={funilSelecionado}
        etapas={etapas}
      />
    </div>
  );
}

export default KanbanPage;