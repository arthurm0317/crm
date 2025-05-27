import React, { useState } from 'react';

function GerirEtapaModal({ theme, show, onHide, onSave, funil, etapas: etapasProp }) {
  const [etapas, setEtapas] = useState(etapasProp || []);

  React.useEffect(() => {
    setEtapas(etapasProp || []);
    // eslint-disable-next-line
  }, [etapasProp, show]);

  const handleEtapaChange = (index, field, value) => {
    const novasEtapas = etapas.map((etapa, i) =>
      i === index ? { ...etapa, [field]: value } : etapa
    );
    setEtapas(novasEtapas);
  };

  const handleAddEtapa = () => {
    setEtapas([...etapas, { nome: '', cor: '#2ecc71' }]);
  };

  const handleRemoveEtapa = (index) => {
    if (etapas.length <= 1) return;
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (etapas.some(e => !e.nome || !e.cor)) {
      alert('Preencha todos os campos obrigatórios das etapas.');
      return;
    }
    if (onSave) onSave(etapas);
    if (onHide) onHide();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-layout-sidebar-inset header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`}>Gerir Etapas do Funil</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className={`form-label card-subtitle-${theme}`}>Funil Selecionado</label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                style={{ backgroundColor: 'transparent' }}
                value={funil?.nome || ''}
                disabled
              />
            </div>
            {etapas.map((etapa, idx) => (
              <div className="row mb-3" key={idx}>
                <div className="col-7">
                  <label className={`form-label card-subtitle-${theme}`}>Nome da Etapa</label>
                  <input
                    type="text"
                    className={`form-control input-${theme}`}
                    value={etapa.nome}
                    onChange={e => handleEtapaChange(idx, 'nome', e.target.value)}
                    placeholder={`Nome da etapa ${idx + 1}`}
                  />
                </div>
                <div className="col-3 d-flex align-items-end">
                  <div className="w-100">
                    <label className={`form-label card-subtitle-${theme}`}>Cor</label>
                    <input
                      type="color"
                      className={`form-control form-control-color border-${theme}`}
                      value={/^#[0-9A-Fa-f]{6}$/.test(etapa.cor) ? etapa.cor : 'transparent'}
                      onChange={e => handleEtapaChange(idx, 'cor', e.target.value)}
                      title="Escolha a cor da etapa"
                      style={{ width: '100%', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>
                <div className="col-2 d-flex align-items-end">
                  <button
                    className="btn btn-sm delete-btn mt-3"
                    onClick={() => handleRemoveEtapa(idx)}
                    disabled={etapas.length <= 1}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
            <button className={`btn btn-2-${theme} w-100 mb-2`} onClick={handleAddEtapa}>
              <i className="bi bi-plus-circle me-2"></i>Nova Etapa
            </button>
          </div>
          <div className="modal-footer">
            <button type="button" className={`btn btn-2-${theme}`} onClick={onHide}>Cancelar</button>
            <button type="button" className={`btn btn-1-${theme}`} onClick={handleSave}>Salvar Etapas</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GerirEtapaModal; 