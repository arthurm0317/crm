import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const NovoMotivoModal = ({ show, onHide, onCreate, theme, loading }) => {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [success, setSuccess] = useState(true); // true = Ganho, false = Perda

  useEffect(() => {
    if (!show) {
      setNome('');
      setErro('');
      setSuccess(true);
    }
  }, [show]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setErro('Digite o nome do motivo');
      return;
    }
    setErro('');
    await onCreate(nome, success, setErro);
    setNome('');
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Container principal do modal de novo motivo - aumentado para 550px */}
      <div style={{ width: '550px', maxWidth: '95vw' }}>
        
        {/* Header do modal de novo motivo */}
        <div style={{ width: '100%' }}>
          <Modal.Header closeButton className={`header-text-${theme}`} style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
            <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>Novo motivo</Modal.Title>
          </Modal.Header>
        </div>
        
        {/* Body do modal de novo motivo */}
        <div style={{ width: '100%' }}>
          <Modal.Body style={{ backgroundColor: `var(--bg-color-${theme})`, padding: '24px' }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 15, fontWeight: 500, marginBottom: '8px' }}>Nome do motivo</Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Digite o motivo"
                disabled={loading}
                style={{ fontSize: 14 }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 15, fontWeight: 500, marginBottom: '8px' }}>Tipo</Form.Label>
              {/* Container dos botões Ganho/Perda */}
              <div style={{ display: 'flex', width: '100%', borderRadius: 6, overflow: 'hidden', border: '1px solid #d1d5db', background: '#f7f7f7' }}>
                {/* Botão Ganho */}
                <div style={{ width: '50%' }}>
                  <div
                    onClick={() => setSuccess(true)}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      background: success ? '#a8ffb0' : 'transparent',
                      color: success ? '#222' : '#222',
                      padding: '10px 0',
                      fontWeight: 600,
                      textAlign: 'center',
                      borderRight: '1px solid #d1d5db',
                      borderRadius: '6px 0 0 6px',
                      transition: 'all 0.18s',
                      fontSize: 14,
                      outline: 'none',
                      userSelect: 'none',
                    }}
                    onMouseOver={e => {
                      if (!success) e.currentTarget.style.background = 'rgba(168,255,176,0.18)';
                    }}
                    onMouseOut={e => {
                      if (!success) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Ganho
                  </div>
                </div>
                {/* Botão Perda */}
                <div style={{ width: '50%' }}>
                  <div
                    onClick={() => setSuccess(false)}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      background: !success ? 'linear-gradient(90deg, #ff5252 0%, #ff1744 100%)' : 'transparent',
                      color: !success ? '#fff' : '#222',
                      padding: '10px 0',
                      fontWeight: 600,
                      textAlign: 'center',
                      borderLeft: 'none',
                      borderRadius: '0 6px 6px 0',
                      transition: 'all 0.18s',
                      fontSize: 14,
                      outline: 'none',
                      userSelect: 'none',
                    }}
                    onMouseOver={e => {
                      if (success) e.currentTarget.style.background = 'rgba(255, 23, 68, 0.13)';
                    }}
                    onMouseOut={e => {
                      if (success) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Perda
                  </div>
                </div>
              </div>
            </Form.Group>
            {erro && <div className="text-danger mb-2" style={{ fontSize: 14 }}>{erro}</div>}
          </Modal.Body>
        </div>
        
        {/* Footer do modal de novo motivo */}
        <div style={{ width: '100%' }}>
          <Modal.Footer style={{ padding: '16px 20px', borderTop: '1px solid #e9ecef', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="outline-secondary" onClick={onHide} disabled={loading} style={{ fontSize: 14, padding: '8px 16px' }}>Cancelar</Button>
            <Button variant="outline-primary" onClick={handleSalvar} disabled={loading || !nome.trim()} style={{ fontSize: 14, padding: '8px 16px' }}>Salvar</Button>
          </Modal.Footer>
        </div>
      </div>
    </Modal>
  );
};

const CustomDropdownMotivo = ({ statusList, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Agrupa motivos
  const motivosGanho = statusList.filter(s => s.success === true && (!search || (s.status || s.value || s.nome || s.label).toLowerCase().includes(search.toLowerCase())));
  const motivosPerda = statusList.filter(s => s.success === false && (!search || (s.status || s.value || s.nome || s.label).toLowerCase().includes(search.toLowerCase())));

  function handleSelect(val) {
    onChange(val);
    setOpen(false);
  }

  function getLabel(val) {
    const found = statusList.find(s => (s.status || s.value || s.nome || s.label) === val);
    return found ? (found.status || found.value || found.nome || found.label) : '';
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          border: '1.2px solid #d1d5db',
          borderRadius: 8,
          background: '#fff',
          padding: '10px 12px',
          fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
          color: value ? '#222' : '#888',
          fontWeight: 500,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 40,
        }}
      >
        <span>{getLabel(value) || 'Selecione...'}</span>
        <span style={{ fontSize: 18, marginLeft: 8, color: '#bbb' }}>&#9662;</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          width: '100%',
          background: '#fff',
          border: '1.2px solid #d1d5db',
          borderRadius: 8,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          zIndex: 1000,
          maxHeight: 260,
          overflowY: 'auto',
        }}>
          <div style={{ padding: 8 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar motivo..."
              style={{ width: '100%', border: '1px solid #eee', borderRadius: 6, padding: '6px 10px', fontSize: 14, marginBottom: 6 }}
              autoFocus
            />
          </div>
          {motivosGanho.length > 0 && (
            <div style={{ padding: '2px 12px 2px 12px', fontSize: 12, color: '#1dbf73', fontWeight: 700, letterSpacing: 0.5, background: 'rgba(168,255,176,0.10)' }}>GANHO</div>
          )}
          {motivosGanho.map((s, idx) => (
            <div
              key={s.id || 'ganho-' + idx}
              onClick={() => handleSelect(s.status || s.value || s.nome || s.label)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: value === (s.status || s.value || s.nome || s.label)
                  ? 'linear-gradient(90deg, #a8ffb0 0%, #eafff0 100%)'
                  : 'transparent',
                color: value === (s.status || s.value || s.nome || s.label) ? '#0a3d2e' : '#222',
                fontWeight: value === (s.status || s.value || s.nome || s.label) ? 700 : 500,
                borderBottom: '1px solid #f2f2f2',
                transition: 'all 0.15s',
                borderRadius: 6,
                margin: '2px 8px',
                marginBottom: 2,
                boxShadow: 'none',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(90deg, rgba(168,255,176,0.22) 0%, rgba(168,255,176,0.32) 100%)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = value === (s.status || s.value || s.nome || s.label)
                  ? 'linear-gradient(90deg, #a8ffb0 0%, #eafff0 100%)'
                  : 'transparent';
              }}
            >
              {s.status || s.value || s.nome || s.label}
            </div>
          ))}
          {motivosPerda.length > 0 && (
            <div style={{ padding: '2px 12px 2px 12px', fontSize: 12, color: '#ff5252', fontWeight: 700, letterSpacing: 0.5, background: 'rgba(255,82,82,0.10)' }}>PERDA</div>
          )}
          {motivosPerda.map((s, idx) => (
            <div
              key={s.id || 'perda-' + idx}
              onClick={() => handleSelect(s.status || s.value || s.nome || s.label)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: value === (s.status || s.value || s.nome || s.label)
                  ? 'linear-gradient(90deg, #ffd6d6 0%, #fff0f0 100%)'
                  : 'transparent',
                color: value === (s.status || s.value || s.nome || s.label) ? '#7a1a1a' : '#222',
                fontWeight: value === (s.status || s.value || s.nome || s.label) ? 700 : 500,
                borderBottom: '1px solid #f2f2f2',
                transition: 'all 0.15s',
                borderRadius: 6,
                margin: '2px 8px',
                marginBottom: 2,
                boxShadow: 'none',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255,82,82,0.18) 0%, rgba(255,23,68,0.22) 100%)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = value === (s.status || s.value || s.nome || s.label)
                  ? 'linear-gradient(90deg, #ffd6d6 0%, #fff0f0 100%)'
                  : 'transparent';
              }}
            >
              {s.status || s.value || s.nome || s.label}
            </div>
          ))}
          {motivosGanho.length === 0 && motivosPerda.length === 0 && (
            <div style={{ padding: 16, color: '#aaa', textAlign: 'center' }}>Nenhum motivo encontrado</div>
          )}
        </div>
      )}
    </div>
  );
};

const FinalizarAtendimentoModal = ({ show, onHide, theme, selectedChat, onFinish }) => {
  const [status, setStatus] = useState('');
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNovoMotivo, setShowNovoMotivo] = useState(false);
  const [loadingNovo, setLoadingNovo] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  console.log('schema', schema);
  const url = process.env.REACT_APP_URL;

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/chat/get-status/${schema}`, { withCredentials: true });
      console.log('res', res.data);
      setStatusList(Array.isArray(res.data.result) ? res.data.result : []);
    } catch {
      setStatusList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && schema) {
      fetchStatus();
    }
    if (!show) {
      setStatus('');
      setError('');
    }
  }, [show, schema, url]);

  const handleFinalizar = async () => {
    if (!status) {
      setError('Selecione o motivo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${url}/chat/close`, {
        chat_id: selectedChat.id,
        schema,
        status
      }, { withCredentials: true });
      if (onFinish) onFinish();
      onHide();
    } catch (err) {
      setError('Erro ao finalizar atendimento');
    }
    setLoading(false);
  };

  const handleCreateMotivo = async (nome, success, setErro) => {
    setLoadingNovo(true);
    try {
      await axios.post(`${url}/chat/create-status`, {
        text: nome,
        success,
        schema
      }, { withCredentials: true });
      setShowNovoMotivo(false);
      await fetchStatus();
    } catch (err) {
      setErro('Erro ao criar motivo');
    }
    setLoadingNovo(false);
  };

  if (!show) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Container principal - aumentado para 600px */}
        <div style={{ width: '600px', maxWidth: '95vw', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ width: '100%' }}>
            <Modal.Header closeButton className={`header-text-${theme}`} style={{ padding: '20px 24px' }}>
              <Modal.Title style={{ fontSize: 20 }}>Finalizar Atendimento</Modal.Title>
            </Modal.Header>
          </div>
          
          {/* Body */}
          <div style={{ width: '100%' }}>
            <Modal.Body style={{ backgroundColor: `var(--bg-color-${theme})`, padding: '24px', width: '100%' }}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: 15, marginBottom: '8px' }}>Motivo</Form.Label>
                  <InputGroup>
                    {/* Dropdown - ajustado para 65% */}
                    <div style={{ flex: 1, minWidth: 0, width: '65%' }}>
                      <CustomDropdownMotivo
                        statusList={statusList}
                        value={status}
                        onChange={setStatus}
                        loading={loading}
                      />
                    </div>
                    {/* Botão Novo motivo - ajustado para 35% */}
                    <div style={{ width: '35%', marginLeft: '8px' }}>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setShowNovoMotivo(true)} 
                        disabled={loadingNovo || loading} 
                        style={{ 
                          fontSize: 13, 
                          width: '100%',
                          whiteSpace: 'nowrap',
                          padding: '8px 12px'
                        }}
                      >
                        Novo motivo
                      </Button>
                    </div>
                  </InputGroup>
                </Form.Group>
                {error && <div className="text-danger mb-2" style={{ fontSize: 14 }}>{error}</div>}
              </Form>
            </Modal.Body>
          </div>
          
          {/* Footer */}
          <div style={{ width: '100%' }}>
            <Modal.Footer style={{ padding: '16px 24px' }}>
              <Button variant="outline-secondary" onClick={onHide} disabled={loading} style={{ fontSize: 14, padding: '8px 16px' }}>Cancelar</Button>
              <Button type="button" variant="outline-primary" onClick={handleFinalizar} disabled={loading || !status} style={{ fontSize: 14, padding: '8px 16px' }}>Finalizar</Button>
            </Modal.Footer>
          </div>
        </div>
      </Modal>
      <NovoMotivoModal
        show={showNovoMotivo}
        onHide={() => setShowNovoMotivo(false)}
        onCreate={handleCreateMotivo}
        theme={theme}
        loading={loadingNovo}
      />
      {/* Adicionar CSS para hover glass verde e vermelho nas opções da lista de motivos */}
      <style>{`
      select option[data-success="ganho"]:hover, select optgroup[label="GANHO"] option:hover {
        background: linear-gradient(90deg, rgba(168,255,176,0.22) 0%, rgba(168,255,176,0.32) 100%);
        color: #0a3d2e !important;
        backdrop-filter: blur(2px);
      }
      select option[data-success="perda"]:hover, select optgroup[label="PERDA"] option:hover {
        background: linear-gradient(90deg, rgba(255,82,82,0.18) 0%, rgba(255,23,68,0.22) 100%);
        color: #7a1a1a !important;
        backdrop-filter: blur(2px);
      }
`}</style>
    </>
  );
};

export default FinalizarAtendimentoModal; 