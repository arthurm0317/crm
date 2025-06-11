import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';

function ImportarContatosModal({ theme, show, onHide, funil }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [mapping, setMapping] = useState({});
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredFields, setRequiredFields] = useState({
    phone: '',
    name: '',
    customId: '' // Campo personalizado que pode servir como ID para disparos
  });
  const fileInputRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  const url = process.env.REACT_APP_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0];
          setAvailableColumns(headers);
          setPreview(jsonData.slice(1, 6)); // Preview das primeiras 5 linhas
          
          // Tenta fazer um mapeamento automático inicial
          const initialMapping = {
            phone: headers.findIndex(h => 
              h?.toLowerCase().includes('phone') || 
              h?.toLowerCase().includes('telefone') || 
              h?.toLowerCase().includes('celular')
            ),
            name: headers.findIndex(h => 
              h?.toLowerCase().includes('name') || 
              h?.toLowerCase().includes('nome')
            ),
            customId: headers.findIndex(h => 
              h?.toLowerCase().includes('id') || 
              h?.toLowerCase().includes('codigo') ||
              h?.toLowerCase().includes('reference')
            )
          };
          setMapping(initialMapping);
        }
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        alert('Erro ao ler o arquivo. Verifique se é um arquivo Excel ou CSV válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (field, value) => {
    setMapping(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const validateData = () => {
    if (!file) return false;
    if (mapping.phone === -1 || mapping.name === -1) {
      alert('É necessário mapear os campos de telefone e nome.');
      return false;
    }
    return true;
  };

  const handleImport = async () => {
    if (!validateData()) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('schema', schema);
      formData.append('funil', funil);

      const response = await axios.post(`${url}/kanban/import-contacts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Contatos importados com sucesso!');
        onHide();
      } else {
        alert('Erro ao importar contatos: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar contatos. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className={`bg-form-${theme}`}>
        <Modal.Title className={`header-text-${theme}`}>
          Importar Contatos
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`bg-form-${theme}`}>
        <div className="mb-4">
          <Form.Group>
            <Form.Label className={`header-text-${theme}`}>Arquivo</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className={`input-${theme}`}
            />
            <Form.Text className={`card-subtitle-${theme}`}>
              Suporta arquivos Excel (.xlsx, .xls) e CSV
            </Form.Text>
          </Form.Group>
        </div>

        {availableColumns.length > 0 && (
          <>
            <div className="mb-4">
              <h6 className={`header-text-${theme} mb-3`}>Mapeamento de Colunas</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className={`card-subtitle-${theme}`}>Telefone *</Form.Label>
                    <Form.Select
                      value={mapping.phone}
                      onChange={(e) => handleMappingChange('phone', e.target.value)}
                      className={`input-${theme}`}
                    >
                      <option value="-1">Selecione...</option>
                      {availableColumns.map((col, idx) => (
                        <option key={idx} value={idx}>{col}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className={`card-subtitle-${theme}`}>Nome *</Form.Label>
                    <Form.Select
                      value={mapping.name}
                      onChange={(e) => handleMappingChange('name', e.target.value)}
                      className={`input-${theme}`}
                    >
                      <option value="-1">Selecione...</option>
                      {availableColumns.map((col, idx) => (
                        <option key={idx} value={idx}>{col}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className={`card-subtitle-${theme}`}>ID Personalizado</Form.Label>
                    <Form.Select
                      value={mapping.customId}
                      onChange={(e) => handleMappingChange('customId', e.target.value)}
                      className={`input-${theme}`}
                    >
                      <option value="-1">Selecione...</option>
                      {availableColumns.map((col, idx) => (
                        <option key={idx} value={idx}>{col}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            </div>

            {preview.length > 0 && (
              <div className="mt-4">
                <h6 className={`header-text-${theme} mb-3`}>Preview dos Dados</h6>
                <div className="table-responsive">
                  <table className={`table table-sm table-${theme}`}>
                    <thead>
                      <tr>
                        {availableColumns.map((header, idx) => (
                          <th key={idx} className={`header-text-${theme}`}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className={`card-subtitle-${theme}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className={`bg-form-${theme}`}>
        <Button onClick={onHide} className={`btn-2-${theme}`}>
          Cancelar
        </Button>
        <Button 
          
          onClick={handleImport}
          className={`btn-1-${theme}`}
          disabled={!file || !validateData()}
        >
          Importar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportarContatosModal; 