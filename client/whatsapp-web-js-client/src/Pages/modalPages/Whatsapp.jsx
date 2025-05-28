import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import WhatsappNovoContatoModal from './Whatsapp_novoContato';
import WhatsappDeleteModal from './Whatsapp_delete';
import WhatsappFilasModal from './Whatsapp_filas';
import axios from 'axios';

function WhatsappModal({ theme, show, onHide }) {
  const [contatos, setContatos] = useState([]);
  const [selectedContato, setSelectedContato] = useState(null);
  const [filas, setFilas] = useState([]);
  const [showNovoContatoModal, setShowNovoContatoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsuariosModal, setShowUsuariosModal] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user')); 
  const schema = userData?.schema
  const url = process.env.REACT_APP_URL;

  useEffect(() => {
    const handleConns = async()=>{
      try{
        const response = await axios.get(`${url}/connection/get-all-connections/${schema}`)
        setContatos(Array.isArray([response.data])?response.data:[response.data]);
      }catch(error){
        console.error(error)
      }
    }
    handleConns()
  }, []);

  const handleNovoContato = (novoContato) => {
    setContatos([...contatos, { ...novoContato, id: Date.now(), status: 'conectado' }]);
    setShowNovoContatoModal(false);
  };

  const handleDelete = (contato) => {
    setContatos(contatos.filter(c => c.id !== contato.id));
    setShowDeleteModal(false);
  };

  const handleVerFilas = (contato) => {
    setSelectedContato(contato);
    setFilas([
      { nome: 'Fila Suporte', setor: 'Suporte', dataVinculacao: '2024-03-15T10:00:00' },
      { nome: 'Fila Vendas', setor: 'Vendas', dataVinculacao: '2024-03-16T11:30:00' }
    ]);
    setShowUsuariosModal(true);
  };

  if (!show) return null;

  const modalContent = (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className={`modal-content bg-form-${theme}`}>
          <div className={`modal-header bg-form-${theme}`}>
            <h5 className={`modal-title header-text-${theme}`}>
              <i className="bi bi-whatsapp me-2"></i> Gerenciar Contatos WhatsApp
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body px-4">
            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className={`btn btn-1-${theme}`}
                onClick={() => setShowNovoContatoModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i> Novo Contato
              </button>
            </div>

            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <table className={`custom-table-${theme} align-middle w-100`}>
                <thead>
                  <tr>
                    <th className="text-start px-3 py-2">Nome</th>
                    <th className="text-start px-3 py-2">Telefone</th>
                    {/* <th className="text-start px-3 py-2">Status</th> */}
                    <th className="text-start px-3 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contatos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center px-3 py-2">
                        <span className={`card-subtitle-${theme}`}>Nenhum contato cadastrado.</span>
                      </td>
                    </tr>
                  ) : (
                    contatos.map((contato) => (
                      <tr key={contato.id}>
                        <td className="px-3 py-2">{contato.name}</td>
                        <td className="px-3 py-2">{contato.number}</td>
                        {/*<td className="px-3 py-2">
                          * <div className="d-flex align-items-center gap-2">
                            <div
                              className={`rounded-circle ${contato.status === 'conectado' ? 'bg-success' : 'bg-danger'}`}
                              style={{ width: '8px', height: '8px' }}
                            ></div>
                            <span>{contato.status === 'conectado' ? 'Conectado' : 'Desconectado'}</span>
                          </div> 
                        </td>*/}
                        <td className="px-3 py-2">
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={`btn btn-sm btn-2-${theme}`}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Editar"
                              onClick={() => {
                                setSelectedContato(contato);
                                setShowNovoContatoModal(true);
                              }}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm btn-2-${theme}`}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Filas"
                              onClick={() => handleVerFilas(contato)}
                            >
                              <i className="bi bi-diagram-3"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm delete-btn"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Excluir"
                              onClick={() => {
                                setSelectedContato(contato);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`modal-footer bg-form-${theme}`}>
            <button type="button" className={`btn btn-2-${theme}`} onClick={onHide}>
              Fechar
            </button>
          </div>
        </div>
      </div>

      <WhatsappNovoContatoModal 
        theme={theme} 
        show={showNovoContatoModal}
        onHide={() => setShowNovoContatoModal(false)}
        onSave={handleNovoContato} 
      />
      
      <WhatsappDeleteModal 
        theme={theme} 
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        contato={selectedContato} 
        onDelete={handleDelete} 
      />
      
      <WhatsappFilasModal 
        theme={theme} 
        show={showUsuariosModal}
        onHide={() => setShowUsuariosModal(false)}
        contato={selectedContato} 
        filas={filas} 
      />
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default WhatsappModal;
