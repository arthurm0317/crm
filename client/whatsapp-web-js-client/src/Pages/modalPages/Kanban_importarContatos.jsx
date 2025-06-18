import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';

function ImportarContatosModal({ theme, show, onHide, funil }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;

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
          setPreview(jsonData.slice(1));
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

  const handleImport = async () => {
    if (!file) {
      setErrorMsg('Selecione um arquivo para importar.');
      return;
    }
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sector', funil);
      formData.append('schema', schema);

      const res = await axios.post('http://localhost:3002/excel/upload', formData, {
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
        <Modal.Title className={`header-text-${theme}`}>Importar Contatos</Modal.Title>
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
          <div style={{ color: 'var(--error-color)', textAlign: 'center', marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        {availableColumns.length > 0 && !errorMsg && (
          <div className="mt-4">
            <h6 className={`header-text-${theme} mb-3`}>Pré-visualização dos Dados</h6>
            <div className={`table-responsive custom-table-${theme}`} style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6 }}>
              <table className="table table-bordered table-hover m-0">
                <thead>
                  <tr>
                    {availableColumns.map((header, idx) => (
                      <th
                        key={idx}
                        className={`header-text-${theme}`}
                        style={{ position: 'sticky', top: 0, zIndex: 2 }}
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
      </Modal.Body>
      <Modal.Footer className={`bg-form-${theme} d-flex justify-content-between align-items-center`}>
        <Button onClick={handleDownloadModelo} className={`btn-2-${theme}`}>Baixar modelo</Button>
        <div>
          <Button onClick={onHide} className={`btn-2-${theme} me-2`}>Cancelar</Button>
          <Button
            onClick={handleImport}
            className={`btn-1-${theme}`}
            disabled={!file}
            style={!file ? { backgroundColor: 'transparent' } : {}}
          >
            Importar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportarContatosModal;
