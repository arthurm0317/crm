import React, { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';

function DespesaModal({ show, onHide, theme, despesa = null, onSave }) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: '',
    fornecedor: '',
    observacoes: '',
    status: 'pendente',
    documentos: [],
    impostos: [],
    itens: []
  });

  const [showImpostoModal, setShowImpostoModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para edição de itens e impostos
  const [editingItem, setEditingItem] = useState(null);
  const [editingImposto, setEditingImposto] = useState(null);
  
  // Estados para o painel de visualização de documentos
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [documentUrl, setDocumentUrl] = useState('');

  const categorias = [
    'Alimentação',
    'Transporte',
    'Serviços',
    'Equipamentos',
    'Marketing',
    'RH',
    'TI',
    'Manutenção',
    'Outros'
  ];

  const tiposImposto = [
    'ICMS',
    'IPI',
    'PIS',
    'COFINS',
    'ISS',
    'IRRF',
    'INSS',
    'CSLL',
    'Outros'
  ];

  useEffect(() => {
    if (despesa) {
      setFormData(despesa);
      setIsEditing(true);
    } else {
      setFormData({
        descricao: '',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0],
        fornecedor: '',
        observacoes: '',
        status: 'pendente',
        documentos: [],
        impostos: [],
        itens: []
      });
      setIsEditing(false);
    }
  }, [despesa]);

  // Limpar URLs de objetos quando o modal for fechado
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const newDocumento = {
        id: Date.now(),
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        dataUpload: new Date().toISOString(),
        valorSugerido: '', // Valor sugerido do WhatsApp
        file: file
      };
      setFormData(prev => ({
        ...prev,
        documentos: [...prev.documentos, newDocumento]
      }));
    }
  };

  const removeDocumento = (documentoId) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter(doc => doc.id !== documentoId)
    }));
    
    // Se o documento removido era o selecionado, fechar o viewer
    if (selectedDocument && selectedDocument.id === documentoId) {
      setSelectedDocument(null);
      setShowDocumentViewer(false);
      setDocumentUrl('');
    }
  };

  const updateDocumentoValor = (documentoId, valor) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.map(doc => 
        doc.id === documentoId 
          ? { ...doc, valorSugerido: valor }
          : doc
      )
    }));
  };

  // Função para abrir o visualizador de documentos
  const openDocumentViewer = (documento) => {
    setSelectedDocument(documento);
    setShowDocumentViewer(true);
    setZoomLevel(100);
    
    // Criar URL para o arquivo
    if (documento.file) {
      const url = URL.createObjectURL(documento.file);
      setDocumentUrl(url);
    }
  };

  // Função para fechar o visualizador
  const closeDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
    setZoomLevel(100);
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
      setDocumentUrl('');
    }
  };

  // Funções de zoom
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  const addImposto = (imposto) => {
    if (editingImposto) {
      // Editar imposto existente
      setFormData(prev => ({
        ...prev,
        impostos: prev.impostos.map(imp => 
          imp.id === editingImposto.id ? { 
            ...imposto, 
            id: imp.id,
            valorCalculado: parseFloat(imposto.valorCalculado) || parseFloat(imposto.valor) || 0
          } : imp
        )
      }));
      setEditingImposto(null);
    } else {
      // Adicionar novo imposto
      setFormData(prev => ({
        ...prev,
        impostos: [...prev.impostos, { 
          ...imposto, 
          id: Date.now(),
          valorCalculado: parseFloat(imposto.valorCalculado) || parseFloat(imposto.valor) || 0
        }]
      }));
    }
  };

  const removeImposto = (impostoId) => {
    setFormData(prev => ({
      ...prev,
      impostos: prev.impostos.filter(imp => imp.id !== impostoId)
    }));
  };

  const editImposto = (imposto) => {
    setEditingImposto(imposto);
    setShowImpostoModal(true);
  };

  const addItem = (item) => {
    if (editingItem) {
      // Editar item existente
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.map(it => 
          it.id === editingItem.id ? { 
            ...item, 
            id: it.id,
            valor: parseFloat(item.valor) || 0,
            quantidade: parseInt(item.quantidade) || 1
          } : it
        )
      }));
      setEditingItem(null);
    } else {
      // Adicionar novo item
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, { 
          ...item, 
          id: Date.now(),
          valor: parseFloat(item.valor) || 0,
          quantidade: parseInt(item.quantidade) || 1
        }]
      }));
    }
  };

  const removeItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));
  };

  const editItem = (item) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const calcularTotalImpostos = () => {
    return formData.impostos.reduce((total, imposto) => {
      // Usar valorCalculado se disponível, senão usar valor
      const valorImposto = parseFloat(imposto.valorCalculado) || parseFloat(imposto.valor) || 0;
      return total + valorImposto;
    }, 0);
  };

  const calcularTotalItens = () => {
    return formData.itens.reduce((total, item) => {
      return total + (parseFloat(item.valor) * (parseInt(item.quantidade) || 1));
    }, 0);
  };

  const calcularTotalDocumentos = () => {
    return formData.documentos.reduce((total, doc) => {
      return total + (parseFloat(doc.valorSugerido) || 0);
    }, 0);
  };

  const handleSave = () => {
    // Calcular valor total real (itens + impostos)
    const totalItens = calcularTotalItens();
    const totalImpostos = calcularTotalImpostos();
    const valorTotalReal = totalItens + totalImpostos;
    
    // Se não há itens categorizados, usar o valor base
    const valorFinal = formData.itens && formData.itens.length > 0 ? valorTotalReal : (parseFloat(formData.valor) || 0);
    
    const despesaCompleta = {
      ...formData,
      id: isEditing ? formData.id : Date.now(),
      dataCriacao: isEditing ? formData.dataCriacao : new Date().toISOString(),
      dataModificacao: new Date().toISOString(),
      totalImpostos: totalImpostos,
      totalItens: totalItens,
      totalDocumentos: calcularTotalDocumentos(),
      valorTotal: valorFinal
    };

    onSave(despesaCompleta);
    onHide();
    setEditingItem(null);
    setEditingImposto(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
      setEditingItem(null);
      setEditingImposto(null);
    }
  };

  if (!show) return null;

  return (
    <>
      <div 
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          overflowY: 'auto',
        }}
        onClick={handleBackdropClick}
      >
        <div 
          className={`modal-dialog modal-lg ${showDocumentViewer ? 'modal-with-viewer' : ''}`}
          style={{
            margin: showDocumentViewer ? 0 : '1.75rem auto',
            maxWidth: showDocumentViewer ? '58%' : '900px',
            width: showDocumentViewer ? '58%' : '98%',
            borderRadius: '16px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            background: 'transparent',
            padding: 0,
            overflow: 'visible',
            transition: 'all 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={{ 
            backgroundColor: `var(--bg-color-${theme})`,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
                         <div className="modal-header gap-3" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', paddingLeft: 0, paddingRight: 0, paddingTop: 0, marginBottom: '16px' }}>
               <i className={`bi bi-cash-stack header-text-${theme}`}></i>
               <h5 className={`modal-title header-text-${theme}`}>
                 {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
               </h5>
               <button 
                 type="button" 
                 className="btn-close" 
                 onClick={() => {
                   onHide();
                   setEditingItem(null);
                   setEditingImposto(null);
                 }}
                 aria-label="Fechar"
               ></button>
             </div>
            <div className="modal-body" style={{ overflowY: 'auto', padding: 0 }}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Descrição *</label>
                  <input
                    type="text"
                    className={`form-control input-${theme}`}
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descrição da despesa"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="valor-base"
                    className={`form-control input-${theme}`}
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Categoria</label>
                  <select
                    className={`form-select input-${theme}`}
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Data *</label>
                  <input
                    type="date"
                    className={`form-control input-${theme}`}
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Fornecedor</label>
                  <input
                    type="text"
                    className={`form-control input-${theme}`}
                    value={formData.fornecedor}
                    onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Status</label>
                  <select
                    className={`form-select input-${theme}`}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Observações</label>
                <textarea
                  className={`form-control input-${theme}`}
                  rows="3"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                />
              </div>

              {/* Seção de Documentos - Melhorada */}
              <div className="mb-4">
                <h6 className={`header-text-${theme} mb-3`}>
                  <i className="bi bi-paperclip me-2"></i>
                  Documentos Anexados
                </h6>
                <div className={`card card-${theme} p-3 mb-3`}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        className={`form-control input-${theme}`}
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                        id="file-upload"
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="file-upload" 
                        className={`btn btn-outline-${theme === 'light' ? 'primary' : 'light'} w-100`}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="bi bi-cloud-upload me-2"></i>
                        Escolher Arquivo
                      </label>
                    </div>
                    <div className="text-center">
                      <small className={`text-${theme === 'light' ? 'muted' : 'light'} d-block`}>
                        Aceita PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                      </small>
                    </div>
                  </div>
                </div>
                
                {formData.documentos.length > 0 && (
                  <div className="table-responsive">
                    <table className={`table custom-table-${theme} mb-0`}>
                      <thead>
                        <tr>
                          <th className={`header-text-${theme}`}>Arquivo</th>
                          <th className={`header-text-${theme}`}>Valor Sugerido</th>
                          <th className={`header-text-${theme}`}>Tamanho</th>
                          <th className={`header-text-${theme}`}>Data</th>
                          <th className={`header-text-${theme}`}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.documentos.map(doc => (
                          <tr key={doc.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-file-earmark me-2"></i>
                                <span className={`header-text-${theme}`}>{doc.nome}</span>
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control form-control-sm input-${theme}`}
                                placeholder="R$ 0,00"
                                value={doc.valorSugerido || ''}
                                onChange={(e) => updateDocumentoValor(doc.id, e.target.value)}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td className={`text-${theme === 'light' ? 'muted' : 'light'}`}>
                              {(doc.tamanho / 1024).toFixed(1)} KB
                            </td>
                            <td className={`text-${theme === 'light' ? 'muted' : 'light'}`}>
                              {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                            </td>
                                                         <td>
                               <div className="d-flex gap-2">
                                 <button
                                   type="button"
                                   className={`icon-btn btn-2-${theme}`}
                                   onClick={() => openDocumentViewer(doc)}
                                   title="Visualizar documento"
                                 >
                                   <i className="bi bi-eye"></i>
                                 </button>
                                 <button
                                   type="button"
                                   className="icon-btn text-danger"
                                   onClick={() => removeDocumento(doc.id)}
                                   title="Remover arquivo"
                                 >
                                   <i className="bi bi-trash-fill"></i>
                                 </button>
                               </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Seção de Itens - Com Custom Table */}
              <div className="mb-4" style={{
                border: !formData.categoria ? `1px solid var(--border-color-${theme})` : 'none',
                borderRadius: !formData.categoria ? '12px' : '0',
                padding: !formData.categoria ? '16px' : '0',
                backgroundColor: !formData.categoria ? `var(--bg-color-${theme})` : 'transparent'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className={`header-text-${theme} mb-0`}>
                    <i className="bi bi-box me-2"></i>
                    Itens da Despesa
                  </h6>
                  <button
                    type="button"
                    className={`btn btn-sm btn-1-${theme}`}
                    onClick={() => setShowItemModal(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    {editingItem ? 'Atualizar' : 'Adicionar'} Item
                  </button>
                </div>
                {formData.itens.length > 0 && (
                  <div className="table-responsive">
                                         <table className={`table custom-table-${theme} mb-0`}>
                                               <thead>
                          <tr>
                            <th className={`header-text-${theme}`} style={{ width: '30%' }}>Item</th>
                            <th className={`header-text-${theme}`} style={{ width: '25%' }}>Observações</th>
                            <th className={`header-text-${theme}`} style={{ width: '8%' }}>Qtd.</th>
                                                         <th className={`header-text-${theme}`} style={{ width: '12%' }}>Unit.</th>
                            <th className={`header-text-${theme}`} style={{ width: '12%' }}>Total</th>
                            <th className={`header-text-${theme}`} style={{ width: '8%' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.itens.map(item => (
                            <tr key={item.id}>
                              <td className={`header-text-${theme}`}>{item.descricao}</td>
                              <td className={`text-${theme === 'light' ? 'muted' : 'light'}`}>
                                {item.observacoes || '-'}
                              </td>
                              <td className={`text-${theme === 'light' ? 'muted' : 'light'} text-center`}>{item.quantidade}</td>
                              <td className={`text-${theme === 'light' ? 'muted' : 'light'} text-end`}>R$ {parseFloat(item.valor).toFixed(2)}</td>
                              <td className={`header-text-${theme} text-end`}>R$ {(parseFloat(item.valor) * parseInt(item.quantidade)).toFixed(2)}</td>
                             <td>
                               <div className="d-flex gap-2">
                                 <button
                                   type="button"
                                   className={`icon-btn btn-2-${theme}`}
                                   onClick={() => editItem(item)}
                                   title="Editar item"
                                 >
                                   <i className="bi bi-pencil-fill"></i>
                                 </button>
                                 <button
                                   type="button"
                                   className="icon-btn text-danger"
                                   onClick={() => removeItem(item.id)}
                                   title="Remover item"
                                 >
                                   <i className="bi bi-trash-fill"></i>
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                )}
              </div>

              {/* Seção de Impostos - Com Custom Table */}
              <div className="mb-4" style={{
                border: !formData.categoria ? `1px solid var(--border-color-${theme})` : 'none',
                borderRadius: !formData.categoria ? '12px' : '0',
                padding: !formData.categoria ? '16px' : '0',
                backgroundColor: !formData.categoria ? `var(--bg-color-${theme})` : 'transparent'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className={`header-text-${theme} mb-0`}>
                    <i className="bi bi-calculator me-2"></i>
                    Impostos
                  </h6>
                  <button
                    type="button"
                    className={`btn btn-sm btn-1-${theme}`}
                    onClick={() => setShowImpostoModal(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    {editingImposto ? 'Atualizar' : 'Adicionar'} Imposto
                  </button>
                </div>
                {formData.impostos.length > 0 && (
                  <div className="table-responsive">
                                         <table className={`table custom-table-${theme} mb-0`}>
                       <thead>
                         <tr>
                           <th className={`header-text-${theme}`} style={{ width: '20%' }}>Tipo</th>
                           <th className={`header-text-${theme}`} style={{ width: '10%' }}>Alíquota</th>
                           <th className={`header-text-${theme}`} style={{ width: '25%' }}>Aplicação</th>
                           <th className={`header-text-${theme}`} style={{ width: '12%' }}>Valor</th>
                           <th className={`header-text-${theme}`} style={{ width: '25%' }}>Observações</th>
                           <th className={`header-text-${theme}`} style={{ width: '8%' }}>Ações</th>
                         </tr>
                       </thead>
                       <tbody>
                         {formData.impostos.map(imposto => (
                           <tr key={imposto.id}>
                             <td className={`header-text-${theme}`}>{imposto.tipo}</td>
                             <td className={`text-${theme === 'light' ? 'muted' : 'light'} text-center`}>{imposto.aliquota}%</td>
                             <td className={`text-${theme === 'light' ? 'muted' : 'light'}`}>
                               {imposto.aplicacao === 'total' ? 'Total da Compra' : 
                                imposto.itemNome ? `Item: ${imposto.itemNome}` : 'Item Específico'}
                             </td>
                             <td className={`text-${theme === 'light' ? 'muted' : 'light'} text-end`}>R$ {parseFloat(imposto.valor).toFixed(2)}</td>
                             <td className={`text-${theme === 'light' ? 'muted' : 'light'}`}>
                               {imposto.observacoes || '-'}
                             </td>
                             <td>
                               <div className="d-flex gap-2">
                                 <button
                                   type="button"
                                   className={`icon-btn btn-2-${theme}`}
                                   onClick={() => editImposto(imposto)}
                                   title="Editar imposto"
                                 >
                                   <i className="bi bi-pencil-fill"></i>
                                 </button>
                                 <button
                                   type="button"
                                   className="icon-btn text-danger"
                                   onClick={() => removeImposto(imposto.id)}
                                   title="Remover imposto"
                                 >
                                   <i className="bi bi-trash-fill"></i>
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                )}
              </div>

                             {/* Resumo Financeiro Modernizado */}
               <div className={`card card-${theme} p-4`} style={{
                 background: `linear-gradient(135deg, var(--bg-color-${theme}) 0%, var(--input-bg-color-${theme}) 100%)`,
                 border: `1px solid var(--border-color-${theme})`,
                 borderRadius: '16px',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                 marginBottom: '24px'
               }}>
                <h6 className={`header-text-${theme} mb-4`} style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  <i className="bi bi-calculator me-2" style={{ color: 'var(--primary-color)' }}></i>
                  Resumo Financeiro
                </h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className={`text-center p-3 rounded`} style={{ 
                      backgroundColor: `var(--input-bg-color-${theme})`,
                      border: `1px solid var(--border-color-${theme})`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}>
                                             <div className={`text-${theme === 'light' ? 'muted' : 'light'} small mb-1`} style={{ fontWeight: '500', fontSize: '0.75rem' }}>Pré-Categorização</div>
                      <div className={`header-text-${theme} h5 mb-0`} style={{ fontWeight: '600' }}>R$ {parseFloat(formData.valor || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className={`text-center p-3 rounded`} style={{ 
                      backgroundColor: `var(--input-bg-color-${theme})`,
                      border: `1px solid var(--border-color-${theme})`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className={`text-${theme === 'light' ? 'muted' : 'light'} small mb-1`} style={{ fontWeight: '500' }}>Total Itens</div>
                      <div className={`header-text-${theme} h5 mb-0`} style={{ fontWeight: '600' }}>R$ {calcularTotalItens().toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className={`text-center p-3 rounded`} style={{ 
                      backgroundColor: `var(--input-bg-color-${theme})`,
                      border: `1px solid var(--border-color-${theme})`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className={`text-${theme === 'light' ? 'muted' : 'light'} small mb-1`} style={{ fontWeight: '500' }}>Total Impostos</div>
                      <div className={`header-text-${theme} h5 mb-0`} style={{ fontWeight: '600' }}>R$ {calcularTotalImpostos().toFixed(2)}</div>
                    </div>
                  </div>
                                     <div className="col-md-3">
                     <div className={`text-center p-3 rounded`} style={{ 
                       background: `linear-gradient(135deg, var(--primary-color) 0%, #0056b3 100%)`,
                       color: 'white',
                       borderRadius: '12px',
                       transition: 'all 0.3s ease'
                     }}>
                       <div className="small mb-1 opacity-90" style={{ fontWeight: '500' }}>Valor Total Real</div>
                       <div className="h5 mb-0 fw-bold">
                         R$ {(calcularTotalItens() + calcularTotalImpostos()).toFixed(2)}
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            
                         {/* Rodapé Corrigido */}
             <div className="modal-footer" style={{ 
               borderTop: `1px solid var(--border-color-${theme})`,
               padding: '16px 0 0 0'
             }}>
              <div className="d-flex justify-content-end gap-2 w-100">
                <button 
                  type="button" 
                  className={`btn btn-2-${theme}`} 
                  onClick={onHide}
                  style={{ minWidth: '120px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`btn btn-1-${theme}`} 
                  onClick={handleSave}
                  style={{ minWidth: '120px' }}
                >
                  {isEditing ? 'Atualizar' : 'Salvar'} Despesa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Visualização de Documentos */}
        {showDocumentViewer && selectedDocument && (
          <div 
            className={`document-viewer-panel ${theme}`}
          >
            {/* Header do Painel */}
            <div className="d-flex justify-content-between align-items-center p-3" style={{ 
              borderBottom: `1px solid var(--border-color-${theme})`,
              backgroundColor: `var(--input-bg-color-${theme})`
            }}>
              <div className="d-flex align-items-center gap-2">
                <i className={`bi bi-file-earmark header-text-${theme}`}></i>
                <h6 className={`header-text-${theme} mb-0`}>{selectedDocument.nome}</h6>
              </div>
              <div className="d-flex gap-2">
                {/* Controles de Zoom */}
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn btn-outline-${theme === 'light' ? 'secondary' : 'light'}`}
                    onClick={zoomOut}
                    title="Diminuir zoom"
                  >
                    <i className="bi bi-zoom-out"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-${theme === 'light' ? 'secondary' : 'light'}`}
                    onClick={resetZoom}
                    title="Zoom padrão"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-${theme === 'light' ? 'secondary' : 'light'}`}
                    onClick={zoomIn}
                    title="Aumentar zoom"
                  >
                    <i className="bi bi-zoom-in"></i>
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDocumentViewer}
                  aria-label="Fechar visualizador"
                ></button>
              </div>
            </div>

            {/* Área de Visualização */}
            <div className="flex-grow-1 p-3" style={{ overflow: 'auto' }}>
              <div 
                className="document-container"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                {selectedDocument.tipo.startsWith('image/') ? (
                  <img
                    src={documentUrl}
                    alt={selectedDocument.nome}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : selectedDocument.tipo === 'application/pdf' ? (
                  <iframe
                    src={documentUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title={selectedDocument.nome}
                  />
                ) : (
                  <div className={`text-center p-5 text-${theme === 'light' ? 'muted' : 'light'}`}>
                    <i className="bi bi-file-earmark-text display-1"></i>
                    <p className="mt-3">Visualização não disponível para este tipo de arquivo</p>
                    <a 
                      href={documentUrl} 
                      download={selectedDocument.nome}
                      className={`btn btn-outline-${theme === 'light' ? 'primary' : 'light'}`}
                    >
                      <i className="bi bi-download me-2"></i>
                      Baixar Arquivo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Imposto */}
      <ImpostoModal
        show={showImpostoModal}
        onHide={() => {
          setShowImpostoModal(false);
          setEditingImposto(null);
        }}
        onSave={addImposto}
        theme={theme}
        tiposImposto={tiposImposto}
        itens={formData.itens}
        calcularTotalItens={calcularTotalItens}
        impostos={formData.impostos}
        editingImposto={editingImposto}
        setEditingImposto={setEditingImposto}
      />

      {/* Modal de Item */}
      <ItemModal
        show={showItemModal}
        onHide={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        onSave={addItem}
        theme={theme}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />


    </>
  );
}

// Modal para adicionar imposto
function ImpostoModal({ show, onHide, onSave, theme, tiposImposto, itens = [], calcularTotalItens, impostos = [], editingImposto = null, setEditingImposto }) {
  const [formData, setFormData] = useState({
    tipo: '',
    aliquota: '',
    aplicacao: 'total', // 'total' ou 'item'
    itemId: '',
    observacoes: ''
  });

  // Carregar dados para edição
  useEffect(() => {
    if (editingImposto) {
      setFormData({
        tipo: editingImposto.tipo,
        aliquota: editingImposto.aliquota,
        aplicacao: editingImposto.aplicacao,
        itemId: editingImposto.itemId ? editingImposto.itemId.toString() : '',
        observacoes: editingImposto.observacoes || ''
      });
    } else {
      setFormData({
        tipo: '',
        aliquota: '',
        aplicacao: 'total',
        itemId: '',
        observacoes: ''
      });
    }
  }, [editingImposto, show]);

  const handleSave = () => {
    // Calcular o valor do imposto baseado na aplicação
    let valorCalculado = 0;
    const aliquotaDecimal = parseFloat(formData.aliquota) / 100;
    
    if (formData.aplicacao === 'total') {
      // Aplicar sobre o valor total da compra (itens + impostos dos itens)
      const totalItens = calcularTotalItens();
      const totalImpostosItens = impostos
        .filter(imp => imp.aplicacao === 'item')
        .reduce((total, imp) => total + (parseFloat(imp.valorCalculado) || parseFloat(imp.valor) || 0), 0);
      
      // Se não há itens, usar o valor base da despesa
      const baseCalculo = totalItens > 0 ? totalItens + totalImpostosItens : parseFloat(document.getElementById('valor-base')?.value || 0);
      valorCalculado = baseCalculo * aliquotaDecimal;
    } else if (formData.aplicacao === 'item' && formData.itemId) {
      // Aplicar sobre um item específico
      const itemSelecionado = itens.find(item => item.id === parseInt(formData.itemId));
      if (itemSelecionado) {
        const valorItem = parseFloat(itemSelecionado.valor) * (parseInt(itemSelecionado.quantidade) || 1);
        valorCalculado = valorItem * aliquotaDecimal;
      }
    }
    
    const impostoCompleto = {
      ...formData,
      valor: valorCalculado.toFixed(2),
      valorCalculado: valorCalculado.toFixed(2),
      itemNome: formData.aplicacao === 'item' && formData.itemId ? 
        itens.find(item => item.id === parseInt(formData.itemId))?.descricao || '' : ''
    };
    
    onSave(impostoCompleto);
    onHide();
    setEditingImposto(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
      setEditingImposto(null);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1060,
        overflowY: 'auto',
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-dialog"
        style={{
          margin: 0,
          maxWidth: '500px',
          width: '98%',
          borderRadius: '16px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          background: 'transparent',
          padding: 0,
          overflow: 'visible',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ 
          backgroundColor: `var(--bg-color-${theme})`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className="modal-header gap-3" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                         <i className={`bi bi-calculator header-text-${theme}`}></i>
             <h5 className={`modal-title header-text-${theme}`}>
               {editingImposto ? 'Editar Imposto' : 'Adicionar Imposto'}
             </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label="Fechar"
            ></button>
          </div>
          <div className="modal-body" style={{ overflowY: 'auto', padding: 0 }}>
            <div className="mb-3">
              <label className={`form-label card-subtitle-${theme}`}>Tipo de Imposto</label>
              <select
                className={`form-select input-${theme}`}
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="">Selecione o tipo</option>
                {tiposImposto.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Alíquota (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control input-${theme}`}
                  value={formData.aliquota}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquota: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Aplicação</label>
                <select
                  className={`form-select input-${theme}`}
                  value={formData.aplicacao}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    aplicacao: e.target.value,
                    itemId: e.target.value === 'total' ? '' : prev.itemId
                  }))}
                >
                  <option value="total">Total da Compra</option>
                  <option value="item">Item Específico</option>
                </select>
              </div>
            </div>
            
            {formData.aplicacao === 'item' && (
              <div className="mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Selecionar Item</label>
                <select
                  className={`form-select input-${theme}`}
                  value={formData.itemId}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                >
                  <option value="">Selecione um item</option>
                  {itens.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.descricao} - R$ {parseFloat(item.valor).toFixed(2)} x {item.quantidade || 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-3">
              <label className={`form-label card-subtitle-${theme}`}>Observações</label>
              <textarea
                className={`form-control input-${theme}`}
                rows="2"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o imposto..."
              />
            </div>
          </div>
          <div className="modal-footer" style={{ 
            borderTop: `1px solid var(--border-color-${theme})`,
            padding: '16px 0 0 0',
            marginTop: '24px'
          }}>
            <div className="d-flex justify-content-end gap-2 w-100">
              <button 
                type="button" 
                className={`btn btn-2-${theme}`} 
                onClick={onHide}
                style={{ minWidth: '120px' }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={`btn btn-1-${theme}`} 
                onClick={handleSave}
                style={{ minWidth: '120px' }}
              >
                Adicionar Imposto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para adicionar item
function ItemModal({ show, onHide, onSave, theme, editingItem = null, setEditingItem }) {
  const [formData, setFormData] = useState({
    descricao: '',
    quantidade: '1',
    valor: '',
    observacoes: ''
  });

  // Carregar dados para edição
  useEffect(() => {
    if (editingItem) {
      setFormData({
        descricao: editingItem.descricao,
        quantidade: editingItem.quantidade,
        valor: editingItem.valor,
        observacoes: editingItem.observacoes || ''
      });
    } else {
      setFormData({
        descricao: '',
        quantidade: '1',
        valor: '',
        observacoes: ''
      });
    }
  }, [editingItem, show]);

  const handleSave = () => {
    onSave(formData);
    onHide();
    setEditingItem(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
      setEditingItem(null);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1060,
        overflowY: 'auto',
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-dialog"
        style={{
          margin: 0,
          maxWidth: '500px',
          width: '98%',
          borderRadius: '16px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          background: 'transparent',
          padding: 0,
          overflow: 'visible',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ 
          backgroundColor: `var(--bg-color-${theme})`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className="modal-header gap-3" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                         <i className={`bi bi-box header-text-${theme}`}></i>
             <h5 className={`modal-title header-text-${theme}`}>
               {editingItem ? 'Editar Item' : 'Adicionar Item'}
             </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label="Fechar"
            ></button>
          </div>
          <div className="modal-body" style={{ overflowY: 'auto', padding: 0 }}>
            <div className="mb-3">
              <label className={`form-label card-subtitle-${theme}`}>Descrição do Item</label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do item"
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  className={`form-control input-${theme}`}
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className={`form-label card-subtitle-${theme}`}>Valor Unitário</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control input-${theme}`}
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className={`form-label card-subtitle-${theme}`}>Observações</label>
              <textarea
                className={`form-control input-${theme}`}
                rows="2"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o item..."
              />
            </div>
          </div>
          <div className="modal-footer" style={{ 
            borderTop: `1px solid var(--border-color-${theme})`,
            padding: '16px 0 0 0',
            marginTop: '24px'
          }}>
            <div className="d-flex justify-content-end gap-2 w-100">
              <button 
                type="button" 
                className={`btn btn-2-${theme}`} 
                onClick={onHide}
                style={{ minWidth: '120px' }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={`btn btn-1-${theme}`} 
                onClick={handleSave}
                style={{ minWidth: '120px' }}
              >
                Adicionar Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DespesaModal; 