import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function CustomValuesModal({ show, onHide, theme}) {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState('');
  const [loading, setLoading] = useState(false);
  const url = process.env.REACT_APP_URL;
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;

  // Buscar campos personalizados ao abrir o modal
  useEffect(() => {
    if (show && schema) {
      setLoading(true);
      axios.get(`${url}/kanban/get-custom-fields/${schema}`, { withCredentials: true })
        .then(res => {
          setFields(Array.isArray(res.data) ? res.data : [res.data]);
        })
        .catch(() => setFields([]))
        .finally(() => setLoading(false));
    }
    if (!show) {
      setNewField('');
    }
  }, [show, schema, url]);

  const handleAdd = async () => {
    if (!newField || !schema) return;
    setLoading(true);
    try {
      await axios.post(`${url}/contact/create-field`, {
        fieldName: newField,
        schema
      }, { withCredentials: true });
      setNewField('');
      const res = await axios.get(`${url}/kanban/get-custom-fields/${schema}`, { withCredentials: true });
      setFields(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
    }
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-values-modal" contentClassName="custom-values-modal-content">
      <Modal.Header closeButton className={`header-text-${theme}`}> 
        <Modal.Title>Campo personalizado</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: `var(--bg-color-${theme})` }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Campo personalizado</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={newField}
              onChange={e => setNewField(e.target.value)}
              placeholder="Digite o nome do campo personalizado"
              style={{ resize: 'none' }}
              disabled={loading}
            />
          </Form.Group>
        </Form>
        {loading && <div className="text-center">Carregando...</div>}
        <ul className="list-group">
          {fields.map((item, idx) => (
            <li key={item.id || idx} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{item.label || item.field_name}</span>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          Fechar
        </Button>
        <Button type="button" variant="outline-primary" onClick={handleAdd} disabled={loading || !newField}>
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomValuesModal;

// Adicionar CSS customizado para diminuir o width do modal
// Sugestão: .custom-values-modal .modal-dialog { max-width: 350px; } 