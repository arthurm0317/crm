import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import * as bootstrap from 'bootstrap';


function DisparoModal({ theme, disparo = null, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [numMensagens, setNumMensagens] = useState(1);
  const [mensagens, setMensagens] = useState([
  { text: '', image: null },
]); 
  const [canal, setCanal] = useState('');
  const [tipoAlvo, setTipoAlvo] = useState('Funil');
  const [funilSelecionado, setFunilSelecionado] = useState('');
  const [funis, setFunis] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [etapa, setEtapa] = useState('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [intervaloTempo, setIntervaloTempo] = useState(30);
  const [intervaloUnidade, setIntervaloUnidade] = useState('segundos');
  const [conexao, setConexao] = useState([]);
  const [customFields ,setCustomFields] = useState([])
  const textAreasRef = useRef([]);
  const [mensagensImagens, setMensagensImagens] = useState([]);


  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData?.schema;
  const url = process.env.REACT_APP_URL;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'tecnico';



  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const novasImagens = [...mensagensImagens];
      novasImagens[index] = base64;
      setMensagensImagens(novasImagens);
    };
    reader.readAsDataURL(file);
  };

const limparBase64 = (base64ComPrefixo) => {
  return base64ComPrefixo.replace(/^data:image\/\w+;base64,/, '');
};


  useEffect(() =>   {
  const carregarDisparo = async () => {
  if (disparo) {
    if (disparo.start_date) {
      const dateObj = new Date(Number(disparo.start_date));
      setDataInicio(dateObj.toISOString().slice(0, 10));
      setHoraInicio(dateObj.toTimeString().slice(0, 5));
    } else {
      setDataInicio('');
      setHoraInicio('');
    }

    setTitulo(disparo.campaing_name || '');
    setCanal(disparo.connection_id || '');
    setTipoAlvo(disparo.tipoAlvo || 'Funil');
    setFunilSelecionado(disparo.sector || '');
    setEtapa(disparo.kanban_stage);
    setTagsSelecionadas(disparo.tags || []);
    
    // Converter o intervalo do banco (em segundos) para a unidade apropriada
    const intervalEmSegundos = Number(disparo.timer) || 30;
    if (intervalEmSegundos >= 3600) {
      setIntervaloTempo(Math.floor(intervalEmSegundos / 3600));
      setIntervaloUnidade('horas');
    } else if (intervalEmSegundos >= 60) {
      setIntervaloTempo(Math.floor(intervalEmSegundos / 60));
      setIntervaloUnidade('minutos');
    } else {
      setIntervaloTempo(intervalEmSegundos);
      setIntervaloUnidade('segundos');
    }

    try {
      const response = await axios.get(`${url}/campaing/get-messages/${disparo.id}/${schema}`,
        {
      withCredentials: true
    });
      const msgs = response.data.result || [];

      const mensagensFormatadas = msgs.map(msg => ({
        id: msg.id || null,
        text: msg.value || '', // Usar 'value' que é o campo correto no banco
        image: msg.image || null
      }));
      
      const imagensFormatadas = mensagensFormatadas.map(msg =>
        msg.image ? `data:image/jpeg;base64,${msg.image}` : null
      );

      setMensagens(mensagensFormatadas);
      setMensagensImagens(imagensFormatadas);
      setNumMensagens(mensagensFormatadas.length);
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMensagens([{ text: '', image: null }]);
      setMensagensImagens([null]);
      setNumMensagens(1);
    }
  } else {
    setTitulo('');
    setNumMensagens(1);
    setMensagens([{ text: '', image: null }]);
    setMensagensImagens([null]);
    setCanal('');
    setTipoAlvo('Funil');
    setFunilSelecionado('');
    setEtapa('');
    setTagsSelecionadas([]);
    setDataInicio('');
    setHoraInicio('');
    setIntervaloTempo(30);
    setIntervaloUnidade('segundos');
  }
};


  carregarDisparo();
}, [disparo, url, schema]);

 

  useEffect(() => {
    const fetchConn = async () => {
      try {
        const response = await axios.get(`${url}/connection/get-all-connections/${schema}`,
        {
      withCredentials: true
    });
        setConexao(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar conexões:', error);
        setConexao([]);
      }
    };
    fetchConn();

    const fetchFunis = async () => {
      try {
        const response = await axios.get(`${url}/kanban/get-funis/${schema}`,
        {
      withCredentials: true
    });
        setFunis(Array.isArray(response.data.name) ? response.data.name : []);
      } catch (error) {
        console.error('Erro ao buscar funis:', error);
      }
    };
    fetchFunis();
  }, [url, schema]);

  useEffect(() => {
    if (!funilSelecionado) {
      setEtapas([]);
      setEtapa('');
      return;
    }
    const fetchEtapas = async () => {
      try {
        const response = await axios.get(`${url}/kanban/get-stages/${funilSelecionado.charAt(0).toLowerCase() + funilSelecionado.slice(1)}/${schema}`,
        {
      withCredentials: true
    });
        setEtapas(Array.isArray(response.data) ? response.data : []);
        setEtapa('');
      } catch (error) {
        console.error(error);
        setEtapas([]);
      }
    };
    fetchEtapas();
  }, [funilSelecionado, url, schema]);
  useEffect(() => {
  if (disparo && disparo.kanban_stage && etapas.length > 0) {
    setEtapa(disparo.kanban_stage);
  }
  if (!disparo) {
    setEtapa('');
  }
  const fetchCustomFields = async () => {
  const response = await axios.get(`${url}/kanban/get-custom-fields/${schema}`,
        {
      withCredentials: true
    })
  setCustomFields(Array.isArray(response.data) ? response.data : [response.data])
  }
  fetchCustomFields()
}, [etapas, disparo]);


  // Atualiza array de mensagens quando o número de mensagens muda
  useEffect(() => {
    const novasMensagens = [...mensagens];
    if (numMensagens > mensagens.length) {
      while (novasMensagens.length < numMensagens) {
       novasMensagens.push({ text: '', image: null }); 
      }
    } else {
      novasMensagens.splice(numMensagens);
    }
    setMensagens(novasMensagens);
  }, [numMensagens]);

  useEffect(() => {
    if (tipoAlvo === 'Funil') {
      setTagsSelecionadas([]);
    } else {
      setFunilSelecionado('');
      setEtapas([]);
    }
  }, [tipoAlvo]);

  const handleIntervaloChange = (valor, unidade) => {
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

  const handleTagSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setTagsSelecionadas(selectedOptions);
  };

  const insertVariable = (index, variable) => {
  const textarea = textAreasRef.current[index];
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const textoAtual = mensagens[index].text; 
  const novaMensagem = 
    textoAtual.slice(0, start) + `{{${variable.field_name}}}` + textoAtual.slice(end);

  const novasMensagens = [...mensagens];
  novasMensagens[index] = { ...mensagens[index], text: novaMensagem };
  setMensagens(novasMensagens);

  setTimeout(() => {
    const novaPos = start + `{{${variable.field_name}}}`.length;
    textarea.focus();
    textarea.setSelectionRange(novaPos, novaPos);
  }, 0);
};


  const handleSave = async () => {
    if (!titulo || !canal || !dataInicio || !horaInicio || mensagens.some(msg => !msg.text)) {
      console.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (tipoAlvo === 'Tag' && tagsSelecionadas.length === 0) {
      console.error('Selecione pelo menos uma tag.');
      return;
    }
    const start_date = dataInicio && horaInicio
      ? `${dataInicio}T${horaInicio}:00-03:00`
      : '';
      
    const mensagensParaSalvar = mensagens.map((msg, index) => {
  const imagem = mensagensImagens[index];

  const base = msg && typeof msg === 'object' && 'text' in msg
    ? msg
    : { text: msg, id: null };

  return {
    id: base.id || null,
    text: base.text,
    image: imagem ? limparBase64(imagem) : base.image || null,
  };
});


  const disparoData = {
    name: titulo,
    connection_id: canal,
    sector: funilSelecionado.charAt(0).toLowerCase() + funilSelecionado.slice(1),
    kanban_stage: etapa,
    start_date,
    schema,
    tipoAlvo,
    ...(tipoAlvo === 'Funil' ? { etapa } : { tags: tagsSelecionadas }),
    mensagem: mensagensParaSalvar,
    intervalo: {
      timer: intervaloTempo,
      unidade: intervaloUnidade
    }
};

    try {
      const endpoint = `${url}/campaing/create`;
      const response = await axios.post(endpoint, {
        ...disparoData,
        ...(disparo ? { campaing_id: disparo.id } : {campaing_id: null})
      },
        {
      withCredentials: true
    });
      
      if (response.status === 201) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('DisparoModal'));
        if (modal) {
          modal.hide();
        }
        
        // Atualizar lista no componente pai
        if (onSave) {
          onSave();
        }
        
      }
    } catch (error) {
      console.error('Erro ao salvar disparo:', error);
    }
  };

  const variaveisFixas = [
  { id: 'contact_name', label: 'Nome', field_name: 'contact_name' },
  { id: 'contact_phone', label: 'Telefone', field_name: 'number' },
    ];

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
                disabled={!isAdmin}
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
           {Array.isArray(mensagens) && mensagens.map((mensagem, index) => (
            <div className="mb-3" key={index}>
              <div>

            <label htmlFor={`mensagem${index}`} className={`form-label card-subtitle-${theme}`}>
            Modelo de mensagem {index + 1}
          </label>
              </div>

          {/* Container para textarea e preview da imagem lado a lado */}
          <div className="d-flex gap-3">
            {/* Preview da imagem ao lado da textarea */}
            {mensagensImagens[index] && (
              <div className="d-flex flex-column align-items-center">
                <img
                  src={mensagensImagens[index]}
                  alt={`Preview ${index}`}
                  className="rounded shadow-sm"
                  style={{ width: '128px', height: '128px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Textarea */}
            <div className="flex-grow-1">
              <textarea
                ref={(el) => textAreasRef.current[index] = el}
                className={`form-control input-${theme}`}
                id={`mensagem${index}`}
                value={mensagem.text}
                onChange={(e) => {
                  const novasMensagens = [...mensagens];
                  const mensagemAtual = mensagens[index];

                  novasMensagens[index] = {
                    ...mensagemAtual,         // mantém id, image e outros
                    text: e.target.value      // atualiza apenas o text
                  };

                  setMensagens(novasMensagens);
                }}
                rows="3"
                placeholder={`Digite a mensagem ${index + 1}`}
              />
            </div>
          </div>
  
    {/* Botões - Separados com divisor vertical */}
    <div className="mt-2 d-flex flex-row items-center gap-1">
      {/* Botão de imagem separado */}
      <button
        type="button"
        className={`btn btn-2-${theme}`}
        onClick={() => document.getElementById(`imageInput-${index}`).click()}
      >
        <i className="bi bi-image me-2"></i>
        Anexar Imagem
      </button>

      <input
        id={`imageInput-${index}`}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleImageUpload(e, index)}
      />

      {/* Divisor vertical */}
      <div 
        className="mx-2" 
        style={{ 
          width: '1px', 
          height: '24px', 
          backgroundColor: `var(--border-color-${theme})`,
          alignSelf: 'center' 
        }}
      ></div>

      {/* Botões de variáveis mapeadas */}
      <div className="d-flex gap-1">
        <p className={`card-subtitle-${theme} d-flex align-items-center me-2`}> Personalizados</p>
        {[...variaveisFixas, ...customFields].map((variable) => (
          <button
            key={variable.id}
            onClick={() => insertVariable(index, variable)}
            className={`btn btn-2-${theme}`}
          >
            {`${variable.label}`}
          </button>
        ))}
      </div>
    </div>
    
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
                    disabled={!isAdmin}
                  >
                    <option value="" disabled>Selecione um canal</option>
                    {Array.isArray(conexao) && conexao.map((conn) => (
                      <option key={conn.number} value={conn.id}>
                        {conn.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Tipo de Alvo com Seleção de Funil */}
                <div className="mb-3">
                  <label className={`form-label card-subtitle-${theme}`}>Tipo de Alvo</label>
                  <div className="d-flex gap-3 align-items-center">
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
                    {/* Lista suspensa de Funis */}
                    {tipoAlvo === 'Funil' && (
                      <select
                        className={`form-select input-${theme} ms-3`}
                        value={funilSelecionado}
                        onChange={(e) => setFunilSelecionado(e.target.value)}
                        style={{ width: 'auto', minWidth: '200px' }}
                      >
                        <option value="" disabled>Selecione um funil</option>
                        {funis.map((funil) => (
                          <option key={funil.id} value={funil.id}>
                            {funil.charAt(0).toUpperCase() + funil.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                {/* Etapa ou Tag (dependendo do tipo de alvo) */}
                {tipoAlvo === 'Funil' ? (
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
                      {Array.isArray(etapas) && etapas.map((etapaObj) => (
                        <option key={etapaObj.id} value={etapaObj.id}>
                          {etapaObj.etapa}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className={`form-label card-subtitle-${theme}`}>
                      Tags (Selecione uma ou mais)
                    </label>
                    <div
                      className={`border rounded p-3 input-${theme}`}
                      style={{
                        height: '140px',
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '10px'
                      }}
                    >
                    </div>
                  </div>
                )}
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