import React, { useState, useRef, useEffect } from 'react';
import * as bootstrap from 'bootstrap';
import LembreteNovoLembrete from './modalPages/Lembrete_novoLembrete';
import LembreteDeletarLembrete from './modalPages/Lembrete_deletarLembrete';

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Mock de lembretes
const mockLembretes = [
  { id: 1, tipo: 'geral', titulo: 'Reunião Geral', mensagem: 'Reunião mensal da empresa', data: '2025-06-10T10:00', icone: 'bi-globe-americas' },
  { id: 2, tipo: 'setorial', titulo: 'Meta do Setor', mensagem: 'Alinhar metas do mês', data: '2025-06-15T14:00', icone: 'bi-diagram-3', filas: ['1'] },
  { id: 3, tipo: 'pessoal', titulo: 'Dentista', mensagem: 'Consulta marcada', data: '2025-06-20T09:00', icone: 'bi-alarm' }
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function LembretesPage({ theme }) {
  const [showNovoLembrete, setShowNovoLembrete] = useState(false);
  const [lembretes, setLembretes] = useState(mockLembretes);
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [popoverDia, setPopoverDia] = useState(null); // {dia, anchor}
  const iconRefs = useRef({});
  const [lembreteEditando, setLembreteEditando] = useState(null);
  const [lembreteDeletando, setLembreteDeletando] = useState(null);
  const [shownToasts, setShownToasts] = useState([]);

  // Navegação do calendário
  const handlePrevMonth = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };
  const handleNextMonth = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };
  const handleHoje = () => {
    const hoje = new Date();
    setMesAtual(hoje.getMonth());
    setAnoAtual(hoje.getFullYear());
  };

  // Adicionar lembrete
  const handleSalvarLembrete = (novo) => {
    setLembretes([...lembretes, { ...novo, id: Date.now() }]);
  };

  // Renderização do calendário
  const diasNoMes = getDaysInMonth(anoAtual, mesAtual);
  const primeiroDiaSemana = getFirstDayOfWeek(anoAtual, mesAtual);
  const dias = [];
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
  for (let d = 1; d <= diasNoMes; d++) dias.push(d);

  // Agrupar lembretes por dia
  const lembretesPorDia = lembretes.reduce((acc, l) => {
    const data = new Date(l.data);
    if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
      const dia = data.getDate();
      if (!acc[dia]) acc[dia] = [];
      acc[dia].push(l);
    }
    return acc;
  }, {});

  // Ordenar lembretes do mais antigo para o mais recente
  const lembretesOrdenados = [...lembretes].sort((a, b) => new Date(a.data) - new Date(b.data));

  // Fecha popover ao clicar fora
  React.useEffect(() => {
    function handleClick(e) {
      if (popoverDia && iconRefs.current[popoverDia.dia] && !iconRefs.current[popoverDia.dia].contains(e.target)) {
        setPopoverDia(null);
      }
    }
    if (popoverDia) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popoverDia]);

  React.useEffect(() => {
    if (lembreteDeletando) {
      const modalElement = document.getElementById('DeleteLembreteModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
      }
    }
  }, [lembreteDeletando]);

  // Function to show a toast notification
  const showToast = (lembrete) => {
    const toastId = `toast-${lembrete.id}-${Date.now()}`;
    const isLight = theme === 'light';
    const bgClass = isLight ? 'bg-light' : 'bg-dark';
    const textClass = isLight ? 'text-dark' : 'text-light';
    const iconColor = isLight ? '#212529' : '#E0E0E0';
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center border-0 ${bgClass}`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.id = toastId;
    toastElement.innerHTML = `
      <div class="toast-header ${bgClass} ${textClass}" style="background-color: var(--input-bg-color-${theme}); border-bottom: 1px solid var(--border-color-${theme});">
        <i class="bi ${lembrete.tipo === 'geral' ? 'bi-globe-americas' : lembrete.tipo === 'setorial' ? 'bi-diagram-3' : lembrete.icone} me-2" style="color: ${iconColor}"></i>
        <strong class="me-auto">${lembrete.titulo}</strong>
        <button type="button" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body ${textClass}">
        ${lembrete.mensagem}
      </div>
    `;
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      toastContainer.appendChild(toastElement);
      const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 10000
      });
      toast.show();
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
    console.log('Toast disparado:', lembrete);
  };

  // Function to check for due reminders
  const checkDueReminders = () => {
    const now = new Date();
    lembretes.forEach(lembrete => {
      const reminderDate = new Date(lembrete.data);
      const reminderKey = `${lembrete.id}-${reminderDate.toISOString().split('T')[0]}`;
      
      // Check if the reminder is due within the last minute and hasn't been shown yet
      if (reminderDate <= now && 
          reminderDate > new Date(now.getTime() - 60000) && 
          !shownToasts.includes(reminderKey)) {
        showToast(lembrete);
        setShownToasts(prev => [...prev, reminderKey]);
      }
    });
  };

  // Set up interval to check for due reminders
  useEffect(() => {
    const interval = setInterval(checkDueReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lembretes, shownToasts]);

  return (
    <div className="h-100 w-100 mx-2">
      {/* Add toast container */}
      <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>
      
      <div className="d-flex flex-row gap-3 h-100" style={{ minHeight: 400 }}>
        {/* Lista de lembretes à esquerda */}
        <div style={{ width: '30%', minWidth: 220, maxWidth: 400, overflowY: 'auto', borderRight: `1px solid var(--border-color-${theme})` }} className="px-3">
          <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h4 className={`fw-bold title-${theme} m-0`}>Lista</h4>
            <button className={`btn btn-1-${theme} d-flex gap-2 align-items-center`} onClick={() => { setLembreteEditando(null); setShowNovoLembrete(true); }}>
              <i className="bi bi-plus-lg"></i> Novo Lembrete
            </button>
          </div>
          {lembretesOrdenados.length === 0 && (
            <div className="text-muted">Nenhum lembrete cadastrado.</div>
          )}
          {lembretesOrdenados.map(l => (
            <div key={l.id} className={`d-flex align-items-center gap-2 mb-2 rounded px-3`} style={{ background: 'var(--input-bg-color-' + theme + ')', border: '1px solid var(--border-color-' + theme + ')', minHeight: 44, paddingTop: 8, paddingBottom: 8 }}>
              <i className={`bi ${l.tipo === 'geral' ? 'bi-globe-americas' : l.tipo === 'setorial' ? 'bi-diagram-3' : l.icone} fs-5 header-text-${theme}`}></i>
              <div className={`flex-grow-1 header-text-${theme}`}>
                <div className="fw-semibold">{l.titulo}</div>
                <div className="small">{new Date(l.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} • {l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1)}</div>
              </div>
              <button
                className={`btn btn-sm btn-2-${theme}`}
                style={{ maxWidth: '38px' }}
                title="Editar"
                onClick={() => { setLembreteEditando(l); setShowNovoLembrete(true); }}
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
              <button
                className={`btn btn-sm delete-btn`}
                style={{ maxWidth: '38px' }}
                title="Excluir"
                onClick={() => setLembreteDeletando(l)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
        </div>
        {/* Calendário à direita */}
        <div style={{ width: '70%' }}>
          <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h4 className={`fw-bold title-${theme} m-0`}>Calendário</h4>
            <div className="d-flex flex-row gap-2 align-items-center">
              <button className="btn btn-2-light btn-sm" onClick={handleHoje}>Hoje</button>
              <button className="btn btn-2-light btn-sm" onClick={handlePrevMonth}><i className="bi bi-chevron-left"></i></button>
              <span className={`title-${theme} fw-bold`} style={{ minWidth: 120, textAlign: 'center' }}>{meses[mesAtual]} {anoAtual}</span>
              <button className="btn btn-2-light btn-sm" onClick={handleNextMonth}><i className="bi bi-chevron-right"></i></button>
            </div>
          </div>
          <div className={`table-responsive custom-table-${theme}`}>
            <table className="table table-bordered table-hover m-0" style={{ borderColor: `var(--border-color-${theme}) !important` }}>
              <thead>
                <tr>
                  <th>Dom</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th><th>Sáb</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(dias.length / 7) }).map((_, i) => (
                  <tr key={i}>
                    {dias.slice(i * 7, i * 7 + 7).map((dia, j) => {
                      const lembretesDia = dia ? (lembretesPorDia[dia] || []) : [];
                      return (
                        <td key={j} style={{ verticalAlign: 'top', minWidth: 80, height: 70, position: 'relative', padding: 4 }}>
                          <div className="d-flex flex-column align-items-start h-100">
                            <span className="fw-bold mb-1">{dia}</span>
                            <div className="w-100 d-flex justify-content-center">
                              {lembretesDia.length > 0 && (
                                <div
                                  ref={el => { if (dia) iconRefs.current[dia] = el; }}
                                  className={`px-2 border-rounded`}
                                  style={{ background: 'var(--input-bg-color-' + theme + ')', border: '1px solid var(--border-color-' + theme + ')', padding: '2px 4px', minWidth: 24, minHeight: 24, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, justifyContent: 'center', cursor: 'pointer' }}
                                  onClick={e => { e.stopPropagation(); setPopoverDia({ dia, anchor: iconRefs.current[dia] }); }}
                                >
                                  {lembretesDia.map((l, idx) => (
                                    <i
                                      key={l.id}
                                      className={`bi ${l.tipo === 'geral' ? 'bi-globe-americas' : l.tipo === 'setorial' ? 'bi-diagram-3' : l.icone}`}
                                      style={{ fontSize: 14 }}
                                    ></i>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Popover de lembretes do dia */}
                            {popoverDia && popoverDia.dia === dia && (
                              <div
                                className={`position-fixed border rounded shadow-sm py-2 px-3`}
                                style={{
                                  zIndex: 10,
                                  top: popoverDia.anchor.getBoundingClientRect().bottom + 4,
                                  left: popoverDia.anchor.getBoundingClientRect().left,
                                  minWidth: 180,
                                  background: `var(--bg-color-${theme})`,
                                  color: `var(--text-color-${theme})`,
                                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                                  border: `1px solid var(--border-color-${theme}) !important`
                                }}
                              >
                                <div className={`d-flex mb-1 justify-content-center`} style={{ color: `var(--primary-color)` }}>Lembretes - dia {dia}</div>
                                {lembretesDia.map(l => (
                                  <div key={l.id} className="mb-2">
                                    <div className={`d-flex align-items-center gap-2 header-text-${theme}`}> 
                                      <i className={`bi ${l.tipo === 'geral' ? 'bi-globe-americas' : l.tipo === 'setorial' ? 'bi-diagram-3' : l.icone}`}></i>
                                      <span className="fw-semibold">{l.titulo}</span>
                                    </div>
                                    <div style={{ fontSize: '0.95rem' }}>{l.mensagem}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <LembreteNovoLembrete
        show={showNovoLembrete}
        onHide={() => { setShowNovoLembrete(false); setLembreteEditando(null); }}
        onSave={novo => {
          if (lembreteEditando) {
            setLembretes(lembretes.map(l => l.id === lembreteEditando.id ? { ...l, ...novo } : l));
          } else {
            setLembretes([...lembretes, { ...novo, id: Date.now() }]);
          }
          setShowNovoLembrete(false);
          setLembreteEditando(null);
        }}
        theme={theme}
        userRole="admin"
        filas={[]}
        {...(lembreteEditando ? {
          tipoDefault: lembreteEditando.tipo,
          lembreteEdit: lembreteEditando
        } : {})}
        onTestToast={showToast}
      />
      <LembreteDeletarLembrete
        theme={theme}
        lembrete={lembreteDeletando}
        onDelete={() => {
          setLembretes(lembretes.filter(l => l.id !== lembreteDeletando.id));
          setLembreteDeletando(null);
        }}
      />
    </div>
  );
}

export default LembretesPage;