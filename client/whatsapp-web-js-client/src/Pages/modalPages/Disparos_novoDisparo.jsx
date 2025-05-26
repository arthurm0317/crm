import React, { useState, useEffect } from 'react';

function DisparoModal({ theme, disparo = null }) {
  // Estados para controlar os campos do formulário
  const [titulo, setTitulo] = useState(disparo?.titulo || '');
  const [numMensagens, setNumMensagens] = useState(1);
  const [mensagens, setMensagens] = useState(disparo?.mensagens || ['']);
  const [canal, setCanal] = useState(disparo?.canal || '');
  const [tipoAlvo, setTipoAlvo] = useState(disparo?.tipoAlvo || 'Funil');
  const [etapa, setEtapa] = useState(disparo?.etapa || '');
  const [dataInicio, setDataInicio] = useState(disparo?.dataInicio || '');
  const [horaInicio, setHoraInicio] = useState(disparo?.horaInicio || '');
  const [intervaloTempo, setIntervaloTempo] = useState(disparo?.intervaloTempo || 30);
  const [intervaloUnidade, setIntervaloUnidade] = useState(disparo?.intervaloUnidade || 'segundos');

  // Lista fictícia de contatos
  const contatos = [
    { id: 1, nome: "Contato 1 - Marketing" },
    { id: 2, nome: "Contato 2 - Vendas" },
    { id: 3, nome: "Contato 3 - Suporte" },
    { id: 4, nome: "Contato 4 - Financeiro" }
  ];

  // Lista fictícia de etapas
  const etapas = [
    { id: 1, nome: "Lead Capturado" },
    { id: 2, nome: "Qualificação Inicial" },
    { id: 3, nome: "Apresentação" },
    { id: 4, nome: "Proposta Enviada" },
    { id: 5, nome: "Negociação" },
    { id: 6, nome: "Fechamento" },
    { id: 7, nome: "Pós-venda" }
  ];

  // Efeito para atualizar o array de mensagens quando o número de mensagens muda
  useEffect(() => {
    const novasMensagens = [...mensagens];
    if (numMensagens > mensagens.length) {
      // Adiciona mensagens vazias
      while (novasMensagens.length < numMensagens) {
        novasMensagens.push('');
      }
    } else {
      // Remove mensagens excedentes
      novasMensagens.splice(numMensagens);
    }
    setMensagens(novasMensagens);
  }, [numMensagens]);

  const handleIntervaloChange = (valor, unidade) => {
    // Converter tudo para segundos para validação
    let valorEmSegundos;
    switch (unidade) {
      case 'horas':
        valorEmSegundos = valor * 3600;
        break;
      case 'minutos':
        valorEmSegundos = valor * 60;
        break;
      default:
        valorEmSegundos = valor;
    }

    // Se for menor que 30 segundos, ajustar para o mínimo
    if (valorEmSegundos < 30) {
      if (unidade === 'segundos') {
        setIntervaloTempo(30);
      } else {
        setIntervaloTempo(1);
      }
    } else {
      setIntervaloTempo(valor);
    }
    setIntervaloUnidade(unidade);
  };

  const handleSave = async () => {
    if (!titulo || !canal || !dataInicio || !horaInicio || mensagens.some(msg => !msg)) {
      console.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const disparoData = {
      titulo,
      mensagens,
      canal,
      tipoAlvo,
      etapa,
      dataInicio,
      horaInicio,
      intervalo: {
        tempo: intervaloTempo,
        unidade: intervaloUnidade
      }
    };

    console.log('Dados do disparo:', disparoData);
    // Aqui você implementará a lógica de salvar no banco de dados
  };

  return (
    <div className="modal fade" id="DisparoModal" tabIndex="-1" aria-labelledby="DisparoModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ backgroundColor: `var(--bg-color-${theme})` }}>
          <div className="modal-header gap-3">
            <i className={`bi bi-megaphone header-text-${theme}`}></i>
            <h5 className={`modal-title header-text-${theme}`} id="DisparoModalLabel">
              {disparo ? 'Editar Disparo' : 'Novo Disparo'}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <div className="modal-body">
            {/* Título */}
            <div className="mb-3">
              <label htmlFor="titulo" className={`form-label card-subtitle-${theme}`}>
                Título
              </label>
              <input
                type="text"
                className={`form-control input-${theme}`}
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título do disparo"
              />
            </div>

            {/* Número de Mensagens */}
            <div className="mb-3">
              <label htmlFor="numMensagens" className={`form-label card-subtitle-${theme}`}>
                Número de Mensagens (1-5)
              </label>
              <input
                type="number"
                className={`form-control input-${theme}`}
                id="numMensagens"
                min="1"
                max="5"
                value={numMensagens}
                onChange={(e) => setNumMensagens(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>

            {/* Campos de Mensagens */}
            {mensagens.map((mensagem, index) => (
              <div className="mb-3" key={index}>
                <label htmlFor={`mensagem${index}`} className={`form-label card-subtitle-${theme}`}>
                  Modelo de mensagem {index + 1}
                </label>
                <textarea
                  className={`form-control input-${theme}`}
                  id={`mensagem${index}`}
                  value={mensagem}
                  onChange={(e) => {
                    const novasMensagens = [...mensagens];
                    novasMensagens[index] = e.target.value;
                    setMensagens(novasMensagens);
                  }}
                  rows="3"
                  placeholder={`Digite a mensagem ${index + 1}`}
                />
              </div>
            ))}

            {/* Grid de 2 colunas para Canal/Tipo e Data/Hora/Intervalo */}
            <div className="row">
              {/* Coluna da Esquerda */}
              <div className="col-6 d-flex flex-column justify-content-center">
                {/* Canal */}
                <div className="mb-3">
                  <label htmlFor="canal" className={`form-label card-subtitle-${theme}`}>
                    Canal
                  </label>
                  <select
                    className={`form-select input-${theme}`}
                    id="canal"
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                  >
                    <option value="" disabled>Selecione um canal</option>
                    {contatos.map((contato) => (
                      <option key={contato.id} value={contato.id}>
                        {contato.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Alvo */}
                <div className="mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Tipo de Alvo</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="tipoFunil"
                        name="tipoAlvo"
                        value="Funil"
                        checked={tipoAlvo === 'Funil'}
                        onChange={(e) => setTipoAlvo(e.target.value)}
                      />
                      <label className={`form-check-label card-subtitle-${theme}`} htmlFor="tipoFunil">
                        Funil
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="tipoTag"
                        name="tipoAlvo"
                        value="Tag"
                        checked={tipoAlvo === 'Tag'}
                        onChange={(e) => setTipoAlvo(e.target.value)}
                      />
                      <label className={`form-check-label card-subtitle-${theme}`} htmlFor="tipoTag">
                        Tag
                      </label>
                    </div>
                  </div>
                </div>

                {/* Etapa */}
                <div className="mb-3">
                  <label htmlFor="etapa" className={`form-label card-subtitle-${theme}`}>
                    Etapa
                  </label>
                  <select
                    className={`form-select input-${theme}`}
                    id="etapa"
                    value={etapa}
                    onChange={(e) => setEtapa(e.target.value)}
                  >
                    <option value="" disabled>Selecione uma etapa</option>
                    {etapas.map((etapa) => (
                      <option key={etapa.id} value={etapa.id}>
                        {etapa.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coluna da Direita */}
              <div className="col-6">
                {/* Data de Início */}
                <div className="mb-3">
                  <label htmlFor="dataInicio" className={`form-label card-subtitle-${theme}`}>
                    Data de Início
                  </label>
                  <input
                    type="date"
                    className={`form-control input-${theme}`}
                    id="dataInicio"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                {/* Hora de Início */}
                <div className="mb-3">
                  <label htmlFor="horaInicio" className={`form-label card-subtitle-${theme}`}>
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    className={`form-control input-${theme}`}
                    id="horaInicio"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>

                {/* Intervalo */}
                <div className="mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Intervalo</label>
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className={`form-control input-${theme}`}
                      id="intervaloTempo"
                      min="1"
                      value={intervaloTempo}
                      onChange={(e) => handleIntervaloChange(parseInt(e.target.value) || 1, intervaloUnidade)}
                      style={{ width: '100px' }}
                    />
                    <select
                      className={`form-select input-${theme}`}
                      id="intervaloUnidade"
                      value={intervaloUnidade}
                      onChange={(e) => handleIntervaloChange(intervaloTempo, e.target.value)}
                    >
                      <option value="segundos">Segundos</option>
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className={`btn btn-2-${theme}`}
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`btn btn-1-${theme}`}
              onClick={handleSave}
            >
              {disparo ? 'Salvar Alterações' : 'Criar Disparo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisparoModal; 