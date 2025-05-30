import React, { useState } from 'react';

function NovoFunilModal({ theme, show, onHide, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [numEtapas, setNumEtapas] = useState(1);
  const [etapas, setEtapas] = useState([
    { nome: '', cor: '#2ecc71' }
  ]);

  // Atualiza o array de etapas quando o número de etapas muda
  React.useEffect(() => {
    let novasEtapas = [...etapas];
    if (numEtapas > etapas.length) {
      while (novasEtapas.length < numEtapas) {
        novasEtapas.push({ nome: '', cor: '#2ecc71' });
      }
    } else {
      novasEtapas = novasEtapas.slice(0, numEtapas);
    }
    setEtapas(novasEtapas);
    // eslint-disable-next-line
  }, [numEtapas]);

  const handleEtapaChange = (index, field, value) => {
    const novasEtapas = etapas.map((etapa, i) =>
      i === index ? { ...etapa, [field]: value } : etapa
    );
    setEtapas(novasEtapas);
  };

  const handleSave = () => {
    if (!titulo || etapas.some(e => !e.nome || !e.cor)) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    if (onSave) onSave({ titulo, etapas });
    if (onHide) onHide();
    setTitulo('');
    setNumEtapas(1);
    setEtapas([{ nome: '', cor: '#2ecc71' }]);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-funnel header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`}>Novo Funil</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {/* Título do Funil */}
            <div className="mb-3">
              <label htmlFor="tituloFunil" className={`form-label card-subtitle-${theme}`}>Título do Funil</label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                id="tituloFunil"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Digite o título do funil"
              />
            </div>
            {/* Número de Etapas */}
            <div className="mb-3">
              <label htmlFor="numEtapas" className={`form-label card-subtitle-${theme}`}>Quantidade de Etapas</label>
              <input
                type="number"
                className={`form-control input-${theme}`}
                id="numEtapas"
                min="1"
                max="10"
                value={numEtapas}
                onChange={e => setNumEtapas(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              />
            </div>
            {/* Inputs das Etapas */}
            {etapas.map((etapa, idx) => (
              <div className="row mb-3" key={idx}>
                <div className="col-8">
                  <label className={`form-label card-subtitle-${theme}`}>Nome da Etapa</label>
                  <input
                    type="text"
                    className={`form-control input-${theme}`}
                    value={etapa.nome}
                    onChange={e => handleEtapaChange(idx, 'nome', e.target.value)}
                    placeholder={`Nome da etapa ${idx + 1}`}
                  />
                </div>
                <div className="col-4 d-flex align-items-end">
                  <div className="w-100">
                    <label className={`form-label card-subtitle-${theme}`}>Cor</label>
                    <input
                      type="color"
                      className={`form-control form-control-color border-${theme}`}
                      value={etapa.cor}
                      onChange={e => handleEtapaChange(idx, 'cor', e.target.value)}
                      title="Escolha a cor da etapa"
                      style={{ width: '100%' , backgroundColor: 'transparent'}}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className={`btn btn-2-${theme}`} onClick={onHide}>Cancelar</button>
            <button type="button" className={`btn btn-1-${theme}`} onClick={handleSave}>Salvar Funil</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NovoFunilModal;
