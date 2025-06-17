import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';

function ImportarContatosModal({ theme, show, onHide, funil, etapas = [] }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [mapping, setMapping] = useState({});
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredFields, setRequiredFields] = useState({
    phone: '',
    name: '',
    customId: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  const url = process.env.REACT_APP_URL;
  const [coluna, setColuna] = useState('');
  const [msg, setMsg] = useState('');

  const handleFileChange = (event) => {
    setErrorMsg('');
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
          setPreview(jsonData.slice(1)); // Mostra todas as linhas
          
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
        } else {
          setErrorMsg('O arquivo está vazio ou não possui dados.');
        }
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        setErrorMsg('Erro ao ler o arquivo. Verifique se é um arquivo Excel ou CSV válido.');
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
      return false;
    }
    return true;
  };

  const handleImport = async () => {
  if (!file || mapping.phone === -1 || mapping.name === -1) {
    setErrorMsg('É necessário mapear os campos de telefone e nome.');
    return;
  }
  setErrorMsg('');
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('sector', funil);
    formData.append('schema', schema);
    // formData.append('connection_id', selectedConnectionId); // descomente e defina se quiser usar

    const res = await axios.post(`${url}/excel/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setMsg(res.data.message);

    if (res.data.success) {
      alert('Contatos importados com sucesso!');
      onHide();
    } else {
      setErrorMsg('Erro ao importar contatos: ' + res.data.message);
    }
  } catch (error) {
    console.error('Erro na importação:', error);
    setErrorMsg('Erro ao importar contatos. Verifique o console para mais detalhes.');
  }
};


  const handleDownloadModelo = () => {
    // Gera um arquivo modelo simples
    const ws = XLSX.utils.aoa_to_sheet([
      ['Telefone', 'Nome', 'ID Personalizado'],
      ['11999999999', 'Exemplo', '123']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'modelo_importacao.xlsx');
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
              className={`input-${theme} mb-1`}
            />
            <Form.Text className={`card-subtitle-${theme}`}>
              Suporta arquivos Excel (.xlsx, .xls) e CSV
            </Form.Text>
          </Form.Group>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--error-color)', background: 'transparent', border: 'none', textAlign: 'center', marginBottom: 16, fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        {availableColumns.length > 0 && !errorMsg && (
          <>
            <div className="mb-4">
              <h6 className={`header-text-${theme} mb-3`}>Mapeamento de Colunas</h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label className={`card-subtitle-${theme}`}>Coluna (Kanban)</Form.Label>
                    <Form.Select
                      value={mapping.kanbanCol}
                      onChange={e => handleMappingChange('kanbanCol', e.target.value)}
                      className={`input-${theme}`}
                    >
                      <option value="-1">Selecione...</option>
                      {availableColumns.map((col, idx) => (
                        <option key={idx} value={idx}>{col}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <h6 className={`header-text-${theme} mb-3`}>Estrutura dos Dados</h6>
                <div
                  className={`table-responsive custom-table-${theme}`}
                  style={{
                    maxHeight: 320,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    border: '1px solid #eee',
                    borderRadius: 6
                  }}
                >
                  <table className="table table-bordered table-hover m-0">
                    <thead>
                      <tr>
                        {availableColumns.map((header, idx) => (
                          <th
                            key={idx}
                            className={`header-text-${theme}`}
                            style={{
                              position: 'sticky',
                              top: 0,
                              zIndex: 2,
                              boxShadow: '0 2px 2px -2px #ccc'
                            }}
                          >
                            {header}
                          </th>
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
      <Modal.Footer className={`bg-form-${theme} d-flex justify-content-between align-items-center`}>
        <div>
          <Button onClick={handleDownloadModelo} className={`btn-2-${theme}`}>Baixar modelo</Button>
        </div>
        <div>
          <Button onClick={onHide} className={`btn-2-${theme} me-2`}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            className={`btn-1-${theme}`}
            disabled={!file || !validateData()}
            style={(!file || !validateData()) ? { backgroundColor: 'transparent' } : {}}
          >
            Importar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportarContatosModal; 