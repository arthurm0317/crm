import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
// Força a largura do modal-xxl para 75vw
const modalStyle = `
    .modal {
        --bs-modal-width: 75vw;
    }
`;

const setoresFicticios = ['Vendas', 'Suporte', 'Financeiro', 'RH'];

const variaveisFixas = [
  { id: 'nome', label: 'Nome', field_name: 'nome' },
  { id: 'telefone', label: 'Telefone', field_name: 'telefone' },
];

function insertVariableNoCampo(campoId, setCampo, variavel) {
  const textarea = document.getElementById(campoId);
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const textoAtual = textarea.value;
  const novoTexto = textoAtual.slice(0, start) + `{{${variavel}}}` + textoAtual.slice(end);
  setCampo(novoTexto);
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + `{{${variavel}}}`.length, start + `{{${variavel}}}`.length);
  }, 0);
}

function QuickMsgManageModal({ theme, show, onHide, mensagens, setMensagens }) {
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ comando: '', mensagem: '', tipo: 'pessoal', setor: '' });
  const [formEdit, setFormEdit] = useState({ comando: '', mensagem: '', tipo: 'pessoal', setor: '' });
  const [filas, setFilas] = useState([]);
   const url = process.env.REACT_APP_URL;
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData.schema

  useEffect(() => {
    if (editIndex !== null && mensagens[editIndex]) {
      setFormEdit({
        comando: mensagens[editIndex].comando,
        mensagem: mensagens[editIndex].mensagem,
        tipo: mensagens[editIndex].tipo,
        setor: mensagens[editIndex].setor || '',
      });
    }
  }, [editIndex, mensagens]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    if (!form.comando.startsWith('/')) return;
    try {
      // Monta o payload conforme esperado pelo backend
      const payload = {
        type: form.tipo,
        queue_id: form.setor,
        user_id: userData.id,
        message: form.mensagem,
        is_command_on: true, // ou false, se quiser permitir desativar
        shortcut: form.comando,
        schema: schema
      };
      await axios.post(`${url}/qmessage/create-q-message`, payload, { withCredentials: true });
      // Atualiza a lista após criar
      const res = await axios.get(`${url}/qmessage/get-q-messages-by-user/${userData.id}/${schema}`, { withCredentials: true });
      const msgs = (res.data.result || []).map(msg => ({
        comando: msg.shortcut || `/msg${msg.id.slice(0, 4)}`,
        mensagem: msg.value,
        tipo: msg.tag,
        setor: filas.find(f => f.id === msg.queue_id)?.name || '',
        id: msg.id
      }));
      setMensagens(msgs);
    } catch (err) {
      // erro silencioso
    }
    setEditIndex(null);
    setForm({ comando: '', mensagem: '', tipo: 'pessoal', setor: '' });
  }

  function handleEdit(idx) {
    setEditIndex(idx);
  }

  async function handleDelete(idx) {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem rápida? Esta ação é irreversível.')) return;
    try {
      const msg = mensagens[idx];
      await axios.delete(`${url}/qmessage/delete-q-message/${msg.id}/${schema}`, { withCredentials: true });
      // Atualiza a lista após deletar
      const res = await axios.get(`${url}/qmessage/get-q-messages-by-user/${userData.id}/${schema}`, { withCredentials: true });
      const msgs = (res.data.result || []).map(msg => ({
        comando: msg.shortcut || `/msg${msg.id.slice(0, 4)}`,
        mensagem: msg.value,
        tipo: msg.tag,
        setor: filas.find(f => f.id === msg.queue_id)?.name || '',
        id: msg.id
      }));
      setMensagens(msgs);
    } catch (err) {
      // erro silencioso
    }
    setEditIndex(null);
  }

  function handleCancel() {
    setEditIndex(null);
    setForm({ comando: '', mensagem: '', tipo: 'pessoal', setor: '' });
  }

  async function handleSaveEdit(idx) {
    if (!formEdit.comando.startsWith('/')) return;
    try {
      const payload = {
        quick_message_id: mensagens[idx].id,
        type: formEdit.tipo,
        queue_id: formEdit.tipo === 'setor' ? formEdit.setor : null,
        message: formEdit.mensagem,
        shortcut: formEdit.comando,
        schema: schema
      };
      await axios.put(`${url}/qmessage/update-q-message`, payload, { withCredentials: true });
      // Atualiza a lista após editar
      const res = await axios.get(`${url}/qmessage/get-q-messages-by-user/${userData.id}/${schema}`, { withCredentials: true });
      const msgs = (res.data.result || []).map(msg => ({
        comando: msg.shortcut || `/msg${msg.id.slice(0, 4)}`,
        mensagem: msg.value,
        tipo: msg.tag,
        setor: filas.find(f => f.id === msg.queue_id)?.name || '',
        id: msg.id
      }));
      setMensagens(msgs);
    } catch (err) {
      // erro silencioso
    }
    setEditIndex(null);
  }
  useEffect(() => {
    async function fetchQuickMessages() {
      try {
        const res = await axios.get(`${url}/qmessage/get-q-messages-by-user/${userData.id}/${schema}`, { withCredentials: true });
        const msgs = (res.data.result || []).map(msg => ({
          comando: msg.shortcut || `/msg${msg.id.slice(0, 4)}`,
          mensagem: msg.value,
          tipo: msg.tag,
          setor: filas.find(f => f.id === msg.queue_id)?.name || '',
          id: msg.id
        }));
        setMensagens(msgs);
      } catch (err) {
        setMensagens([]);
      }
    }
    fetchQuickMessages();
  }, [schema, url, filas]);

  useEffect(() => {
    async function fetchFilas() {
      try {
        const res = await axios.get(`${url}/queue/get-all-queues/${schema}`, { withCredentials: true });
        setFilas(res.data.result || []);
      } catch (err) {
        setFilas([]);
      }
    }
    fetchFilas();
  }, [schema, url]);
  return (
    <>
      <style>{modalStyle}</style>
      <Modal
        show={show}
        onHide={onHide}
        centered
        className={`modal-${theme}`}
        dialogClassName="modal-xxl"
      >
        <Modal.Header closeButton style={{ backgroundColor: `var(--bg-color-${theme})`, borderBottom: `1px solid var(--border-color-${theme})` }}>
          <div className="d-flex align-items-center gap-3">
            <i className={`bi bi-lightning-charge header-text-${theme}`}></i>
            <h5 className={`modal-title mb-0`} style={{ color: `var(--color-${theme})` }}>
              Gerenciar Mensagens Rápidas
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: `var(--bg-color-${theme})`, padding: '8px 0' }}>
          <div style={{
            maxHeight: 400,
            overflowY: 'auto',
            marginBottom: 0,
            borderRadius: 0,
            border: 'none',
            background: `var(--bg-color-${theme})`,
            padding: 0,
            color: `var(--color-${theme})`,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}>
            {mensagens.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>Nenhuma mensagem cadastrada</div>}
            {mensagens.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gap: 4,
                  gridTemplateColumns: '140px 120px 2.5fr 120px',
                  alignItems: 'center',
                  fontSize: 14,
                  background: 'transparent',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '0 0 0 0',
                  minHeight: 48,
                  transition: 'background 0.15s',
                  color: `var(--color-${theme})`,
                }}
              >
                <div style={{ color: 'var(--secondary-color)', fontWeight: 600, fontSize: 13, paddingLeft: 18 }}>
                  {editIndex === idx ? (
                    <Form.Select
                      size="sm"
                      value={formEdit.tipo}
                      name="tipo"
                      style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, minWidth: 90 }}
                      onChange={e => setFormEdit(f => ({ ...f, tipo: e.target.value }))}
                    >
                      <option value="pessoal">Pessoal</option>
                      <option value="setor">Setor</option>
                    </Form.Select>
                  ) : (
                    msg.tipo === 'setor' ? `Setor • ${msg.setor}` : 'Pessoal'
                  )}
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--primary-color)', fontWeight: 500, fontSize: 13, padding: '0 0 0 4px' }}>
                  {editIndex === idx ? (
                    <InputGroup size="sm">
                      <InputGroup.Text style={{ background: `var(--bg-color-${theme})`, color: `var(--color-${theme})`, borderColor: `var(--border-color-${theme})` }}>/</InputGroup.Text>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formEdit.comando.startsWith('/') ? formEdit.comando.slice(1) : formEdit.comando}
                        name="comando"
                        style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, minWidth: 90 }}
                        onChange={e => setFormEdit(f => ({ ...f, comando: '/' + e.target.value.replace(/^\/*/, '') }))}
                      />
                    </InputGroup>
                  ) : (
                    msg.comando
                  )}
                  {editIndex === idx && !formEdit.comando.startsWith('/') && formEdit.comando.length > 0 && (
                    <div style={{ color: 'var(--error-color)', fontSize: 11, marginTop: 2 }}>
                      O comando deve começar com /
                    </div>
                  )}
                </div>
                <div style={{
                  color: `var(--color-${theme})`,
                  fontSize: 14,
                  padding: '0 4px',
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 120,
                }}>
                  {editIndex === idx ? (
                    <>
                      {formEdit.tipo === 'setor' && (
                        <Form.Select
                          size="sm"
                          value={formEdit.setor}
                          name="setor"
                          style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, minWidth: 90 }}
                          onChange={e => setFormEdit(f => ({ ...f, setor: e.target.value }))}
                        >
                          <option value="">Selecione o setor</option>
                          {filas.map(f => <option key={f.id} value={f.id}>{f.name || f.nome}</option>)}
                        </Form.Select>
                      )}
                      <textarea
                        value={formEdit.mensagem}
                        onChange={e => setFormEdit(f => ({ ...f, mensagem: e.target.value }))}
                        style={{ width: '100%', minHeight: 38, resize: 'vertical', fontSize: 14, color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, border: `1px solid var(--border-color-${theme})`, borderRadius: 6, padding: 6 }}
                        autoFocus
                      />
                      <Button className={`btn-2-${theme}`} style={{ minWidth: 42, fontSize: 15 }} onClick={() => handleSaveEdit(idx)}>
                        <i className="bi bi-floppy"></i>
                      </Button>
                      <Button size="sm" className={`btn-2-${theme}`} style={{ minWidth: 42, fontSize: 15, padding: '6px 0' }} onClick={handleCancel}>
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </>
                  ) : (
                    // Exibição truncada
                    msg.mensagem.length > 30 ? msg.mensagem.slice(0, 30) + '...' : msg.mensagem
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <Button size="sm" className={`btn-2-${theme}`} style={{ minWidth: 42, fontSize: 15, padding: '6px 0', background: 'transparent' }} onClick={() => handleEdit(idx)} disabled={editIndex !== null}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button size="sm" className={`btn-2-${theme}`} style={{ minWidth: 42, fontSize: 15, padding: '6px 0', borderColor: `var(--error-color)`, color: `var(--error-color)` }} onClick={() => handleDelete(idx)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Modal.Footer style={{ borderTop: `1px solid var(--border-color-${theme})`, background: `var(--bg-color-${theme})`, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12, borderBottomLeftRadius: 'var(--bs-modal-inner-border-radius)', borderBottomRightRadius: 'var(--bs-modal-inner-border-radius)' }}>
            <Form style={{ width: '100%' }}>
              {/* Linha de campos alinhados horizontalmente, sem botões de variáveis visíveis */}
              <div className="row" style={{ marginTop: 8, gap: 0 }}>
                <div className="col-auto d-flex flex-column align-items-start justify-content-end" style={{ minWidth: 120, flex: '0 0 120px', height: 60 }}>
                  <Form.Label style={{ fontSize: 13, fontWeight: 500, color: `var(--color-${theme})` }}>Categoria</Form.Label>
                  <Form.Select
                    size="sm"
                    value={form.tipo}
                    name="tipo"
                    style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, height: 38 }}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    disabled={editIndex !== null}
                  >
                    <option value="pessoal">Pessoal</option>
                    <option value="setor">Setor</option>
                  </Form.Select>
                </div>
                {form.tipo === 'setor' && (
                  <div className="col-auto d-flex flex-column align-items-start justify-content-end" style={{ minWidth: 130, flex: '0 0 130px', height: 60 }}>
                    <Form.Label style={{ fontSize: 13, fontWeight: 500, color: `var(--color-${theme})` }}>Setor</Form.Label>
                    <Form.Select
                      size="sm"
                      value={form.setor}
                      name="setor"
                      style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, height: 38 }}
                      onChange={e => setForm(f => ({ ...f, setor: e.target.value }))}
                      disabled={editIndex !== null}
                    >
                      <option value="">Selecione o setor</option>
                      {filas.map(f => <option key={f.id} value={f.id}>{f.name || f.nome}</option>)}
                    </Form.Select>
                  </div>
                )}
                <div className="col-auto d-flex flex-column align-items-start justify-content-end" style={{ minWidth: 120, flex: '0 0 120px', height: 60 }}>
                  <Form.Label style={{ fontSize: 13, fontWeight: 500, color: `var(--color-${theme})` }}>Comando</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ background: `var(--bg-color-${theme})`, color: `var(--color-${theme})`, borderColor: `var(--border-color-${theme})`, height: 38 }}>/</InputGroup.Text>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={form.comando.startsWith('/') ? form.comando.slice(1) : form.comando}
                      name="comando"
                      style={{ color: `var(--color-${theme})`, background: `var(--bg-color-${theme})`, borderColor: `var(--border-color-${theme})`, minWidth: 90, height: 38 }}
                      onChange={e => setForm(f => ({ ...f, comando: '/' + e.target.value.replace(/^\/*/, '') }))}
                      disabled={editIndex !== null}
                    />
                  </InputGroup>
                </div>
                <div className="col d-flex flex-column align-items-start justify-content-end" style={{ minWidth: 220, flex: 1, height: 60 }}>
                  <Form.Label style={{ fontSize: 13, fontWeight: 500, color: `var(--color-${theme})` }}>Mensagem</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="mensagemCampo"
                    rows={2}
                    value={form.mensagem}
                    name="mensagem"
                    onChange={handleChange}
                    style={{ fontSize: 14, minHeight: 38, resize: 'none', height: 38 }}
                    placeholder="Digite a mensagem rápida..."
                    disabled={editIndex !== null}
                  />
                </div>
                <div className="col-auto d-flex align-items-end" style={{ minWidth: 120, paddingBottom: 0, height: 60 }}>
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    style={{ height: 38 }}
                    onClick={handleSave}
                    disabled={editIndex !== null || !form.comando.startsWith('/') || !form.mensagem.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
              {/* Edição */}
              {editIndex !== null && (
                <div className="row align-items-end" style={{ marginTop: 8 }}>
                  <div className="col" style={{ minWidth: 220, position: 'relative' }}>
                    <Form.Label style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: `var(--color-${theme})` }}>Mensagem</Form.Label>
                    <Form.Control
                      as="textarea"
                      id="mensagemCampoEdit"
                      rows={2}
                      value={formEdit.mensagem}
                      name="mensagem"
                      onChange={e => setFormEdit(f => ({ ...f, mensagem: e.target.value }))}
                      style={{ fontSize: 14, marginBottom: 8, minHeight: 38 }}
                      placeholder="Digite a mensagem rápida..."
                    />
                    <div className="d-flex gap-1 align-items-center mt-1">
                      <span style={{ fontSize: 11, color: 'var(--color-'+theme+')' }}>Vars:</span>
                      {variaveisFixas.map(v => (
                        <button
                          key={v.id}
                          type="button"
                          className={`btn btn-2-${theme} btn-sm`}
                          style={{ fontSize: 10, padding: '2px 6px', minWidth: 'auto' }}
                          tabIndex={-1}
                          onClick={() => insertVariableNoCampo('mensagemCampoEdit', val => setFormEdit(f => ({ ...f, mensagem: val })), v.field_name)}
                        >
                          {`{{${v.label}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default QuickMsgManageModal;
