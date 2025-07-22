import { useEffect, useState } from 'react';
import * as bootstrap from 'bootstrap';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard({ theme }) {
  const url = process.env.REACT_APP_URL;
  const userData = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState()
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGraficoTab, setActiveGraficoTab] = useState('ganhos');
  const [closedChats, setClosedChats] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const schema = userData.schema
  const [userNames, setUserNames] = useState({});
  const [rankingFiltro, setRankingFiltro] = useState('diario');

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
    return () => tooltipList.forEach((tooltip) => tooltip.dispose());
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${url}/api/users/${schema}`, {
          withCredentials: true
        });
        setUser(response.data.users || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };
    fetchUsuarios();
  }, []);

  useEffect(() => {

      const fetchClosedChats = async () => {
        try {
          const response = await axios.get(`${url}/chat/get-closed-chats/${schema}`, {
            withCredentials: true
          });
          setClosedChats(response.data.result || []);
        } catch (error) {
          setClosedChats([]);
        }
      };
      const fetchStatusList = async () => {
        try {
          const response = await axios.get(`${url}/chat/get-status/${schema}`, {
            withCredentials: true
          });
          setStatusList(response.data.result || []);
        } catch (error) {
          setStatusList([]);
        }
      };
      fetchClosedChats();
      fetchStatusList();
    
  }, [ schema, url]);

  // Buscar nomes dos usuários do ranking
  useEffect(() => {
    async function fetchUserNames() {
      // Pega todos os user_id únicos das conversas fechadas
      const ids = Array.from(new Set(closedChats.map(c => c.user_id).filter(Boolean)));
      if (ids.length === 0) return;
      const namesMap = {};
      for (const id of ids) {
        try {
          const res = await axios.get(`${url}/api/users/${schema}`);
          const user = (res.data.users || []).find(u => u.id === id);
          if (user) namesMap[id] = user.nome || user.username || user.name;
        } catch (e) {}
      }
      setUserNames(namesMap);
    }
    if (closedChats.length > 0) fetchUserNames();
  }, [closedChats, url, schema]);

  // Função para filtrar por data
  function filtrarPorPeriodo(arr, filtro) {
    const now = new Date();
    return arr.filter(c => {
      if (!c.closed_at) return false;
      const closed = new Date(c.closed_at);
      if (filtro === 'diario') {
        return closed.toDateString() === now.toDateString();
      }
      if (filtro === 'semanal') {
        const diff = (now - closed) / (1000 * 60 * 60 * 24);
        return diff < 7;
      }
      if (filtro === 'mensal') {
        const diff = (now - closed) / (1000 * 60 * 60 * 24);
        return diff < 30;
      }
      return true;
    });
  }

  // Agrupar conversas encerradas por user_id, considerando filtro
  const closedChatsFiltrados = filtrarPorPeriodo(closedChats, rankingFiltro);
  const ranking = Object.entries(
    closedChatsFiltrados.reduce((acc, c) => {
      if (!c.user_id) return acc;
      acc[c.user_id] = (acc[c.user_id] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Mapear statusId para sucesso
  const statusSuccessMap = {};
  statusList.forEach(s => {
    statusSuccessMap[s.value] = s.success;
  });

  // Separar ganhos e perdas pelo status do chat
  const ganhos = closedChats.filter(c => statusSuccessMap[c.status] === true);
  const perdas = closedChats.filter(c => statusSuccessMap[c.status] === false);

  // Agrupar por status
  function groupByStatus(arr) {
    const map = {};
    arr.forEach(c => {
      const key = c.status || 'Indefinido';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }

  // Nome amigável para o status
  function getStatusLabel(status) {
    const found = statusList.find(s => s.value === status);
    return found ? found.value : status;
  }

  const ganhosDataRaw = groupByStatus(ganhos);
  const perdasDataRaw = groupByStatus(perdas);

  const ganhosLabels = Object.keys(ganhosDataRaw).map(getStatusLabel);
  const ganhosValues = Object.values(ganhosDataRaw);
  const perdasLabels = Object.keys(perdasDataRaw).map(getStatusLabel);
  const perdasValues = Object.values(perdasDataRaw);

  // Dados para gráfico de barra
  const chartData = {
    labels: activeGraficoTab === 'ganhos' ? ganhosLabels : perdasLabels,
    datasets: [
      {
        label: 'Quantidade',
        data: activeGraficoTab === 'ganhos' ? ganhosValues : perdasValues,
        backgroundColor: activeGraficoTab === 'ganhos' ? '#28a745' : '#dc3545',
        barPercentage: 1,
        categoryPercentage: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: activeGraficoTab === 'ganhos' ? 'Motivos de Ganhos' : 'Motivos de Perdas',
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dados para gráfico donut
  const donutData = {
    labels: ['Ganhos', 'Perdas'],
    datasets: [
      {
        data: [ganhos.length, perdas.length],
        backgroundColor: ['#28a745', '#dc3545'],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: {
        display: true,
        text: 'Ganhos x Perdas',
      },
    },
    cutout: '70%',
  };

  return (
    <div className="container-fluid h-100 pt-3">
      <h2 className={`mb-3 ms-3 header-text-${theme}`} style={{ fontWeight: 400 }}>Dashboard</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link${activeTab === 'dashboard' ? ' active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            type="button"
          >
            Visão Geral
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link${activeTab === 'graficos' ? ' active' : ''}`}
            onClick={() => setActiveTab('graficos')}
            type="button"
          >
            Gráficos
          </button>
        </li>
      </ul>
      {activeTab === 'dashboard' && (
        <div className="row h-100">
          {/* Coluna 1 */}
          <div className="col-4 offset-2 d-flex flex-column gap-3">
            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-hourglass card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Fila de Atendimento</h6>
                <h2 id="contatos-aguardando" className={`header-text-${theme}`}>2</h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Quantidade de filas de atendimento."
                ></i>
              </div>
            </div>

            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-person-check card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Atendentes online</h6>
                <h2 id="atendentes-online" className={`header-text-${theme}`}>
                {user && Array.isArray(user)
                  ? user.filter(u => u.online && u.permission === 'user').length
                  : 0}
              </h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Total de atendentes humanos atendendo no momento."
                ></i>
              </div>
            </div>

            <div className={`card p-3 card-${theme}`}>
              <h6 className={`card-subtitle-${theme}`}>Atendentes</h6>
              <ul id="lista-atendentes" className="list-unstyled mb-0 d-flex flex-column lista-tabela">
                <li className={`d-flex justify-content-between table-header-${theme} px-2 py-1`}>
                  <span>Nome</span>
                  <span>Setor</span>
                  <span>Status</span>
                </li>
                {user && user
                .filter(u => u.permission === 'user')
                .map((u) => (
                  <li key={u.id} className={`d-flex justify-content-between px-2 py-1 header-text-${theme}`}>
                    <span>{u.nome || u.username || u.name}</span>
                    <span>{u.setor || u.sector || '-'}</span>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: u.online ? '#28a745' : '#dc3545'
                        }}
                      ></span>
                    </span>
                  </li>
              ))}
              </ul>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="col-4 d-flex flex-column gap-3">
            {/*
            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-cpu card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Contatos com IA</h6>
                <h2 id="contatos-ia" className={`header-text-${theme}`}>0</h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Conversas em andamento mediadas exclusivamente pela IA."
                ></i>
              </div>
            </div>
            */}

            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-check2-all card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Conversas finalizadas</h6>
                <h2 id="esperando-atendente" className={`header-text-${theme}`}>{closedChats.length}</h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Conversas que terminaram e foram encerradas."
                ></i>
              </div>
            </div>

            <div className={`card p-3 card-${theme}`}>
              <h6 className={`card-subtitle-${theme}`}>Ranking - Conversas Encerradas</h6>
              <div className="btn-group px-5 py-2" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="ranking-conversas"
                  id="btnradio1"
                  autoComplete="off"
                  checked={rankingFiltro === 'diario'}
                  onChange={() => setRankingFiltro('diario')}
                />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio1">
                  Diário
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="ranking-conversas"
                  id="btnradio2"
                  autoComplete="off"
                  checked={rankingFiltro === 'semanal'}
                  onChange={() => setRankingFiltro('semanal')}
                />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio2">
                  Semanal
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="ranking-conversas"
                  id="btnradio3"
                  autoComplete="off"
                  checked={rankingFiltro === 'mensal'}
                  onChange={() => setRankingFiltro('mensal')}
                />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio3">
                  Mensal
                </label>
              </div>
              <ul id="ranking-conversas" className="mb-0 d-flex flex-column lista-tabela ps-0">
                <li className={`d-flex justify-content-between table-header-${theme} px-2 py-1`}>
                  <span style={{ width: '20%' }}></span>
                  <span style={{ width: '50%' }}>Nome</span>
                  <span style={{ width: '30%', textAlign: 'right' }}>Total</span>
                </li>
                {ranking.map(([userId, total], idx) => (
                  <li key={userId} className={`d-flex justify-content-between px-2 py-1 header-text-${theme}`}>
                    <span style={{ width: '20%' }}>{idx + 1}º</span>
                    <span style={{ width: '50%' }}>{userNames[userId] || userId}</span>
                    <span style={{ width: '30%', textAlign: 'right' }}>{total}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna 3 */}
          {/*
          <div className="col-4 d-flex flex-column gap-3">
            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-stopwatch card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Tempo médio de resposta</h6>
                <h2 id="tempo-resposta" className={`header-text-${theme}`}>--</h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Tempo médio que o atendente leva para responder após o contato ir para a fila de atendimento."
                ></i>
              </div>
            </div>

            <div className={`card card-${theme} p-2 d-flex flex-row align-items-center justify-content-evenly`}>
              <i className="bi bi-hourglass-split card-icon" style={{ fontSize: '2.5rem' }}></i>
              <div className="d-flex flex-column align-items-start justify-content-start">
                <h6 className={`card-subtitle-${theme} m-0`}>Tempo médio de resolução</h6>
                <h2 id="tempo-resolucao" className={`header-text-${theme}`}>--</h2>
              </div>
              <div>
                <i
                  className={`bi bi-question-circle question-${theme}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Tempo médio desde o início da intervenção do atendente até o encerramento."
                ></i>
              </div>
            </div>

            <div className={`card p-3 card-${theme}`}>
              <h6 className={`card-subtitle-${theme}`}>Ranking - Tempo de Resposta</h6>
              <div className="btn-group px-5 py-2" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="ranking-tempo"
                  id="btnradio4"
                  autoComplete="off"
                  defaultChecked
                />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio4">
                  Diário
                </label>
                <input type="radio" className="btn-check" name="ranking-tempo" id="btnradio5" autoComplete="off" />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio5">
                  Semanal
                </label>
                <input type="radio" className="btn-check" name="ranking-tempo" id="btnradio6" autoComplete="off" />
                <label className={`btn btn-primary btn-label-${theme}`} htmlFor="btnradio6">
                  Mensal
                </label>
              </div>
              <ul id="ranking-tempo" className="mb-0 d-flex flex-column lista-tabela ps-0"></ul>
            </div>
          </div>
          */}
        </div>
      )}
      {activeTab === 'graficos' && (
        <div className="row h-100">
          <div className="col-12">
            <div className={`card card-${theme} p-4 position-relative`}>
              <h4 className={`header-text-${theme}`}>Gráficos</h4>
              {/* Dropdown flutuante no topo direito */}
              <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}>
                <select
                  className="form-select form-select-sm"
                  value={chartType}
                  onChange={e => setChartType(e.target.value)}
                  style={{ minWidth: 120 }}
                >
                  <option value="bar">Gráfico de Barra</option>
                  <option value="donut">Gráfico Donut</option>
                </select>
              </div>
              {/* Botões Ganhos/Perdas só aparecem no gráfico de barra */}
              {chartType === 'bar' && (
                <div className="btn-group mt-2 mb-3" role="group" style={{ maxWidth: 250 }}>
                  <button
                    type="button"
                    className={`btn btn-outline-success btn-sm${activeGraficoTab === 'ganhos' ? ' active' : ''}`}
                    onClick={() => setActiveGraficoTab('ganhos')}
                  >
                    Ganhos
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-danger btn-sm${activeGraficoTab === 'perdas' ? ' active' : ''}`}
                    onClick={() => setActiveGraficoTab('perdas')}
                  >
                    Perdas
                  </button>
                </div>
              )}
              <div style={{ display:'flex', width:'100%', height: '400px', maxHeight:'400px', display: 'flex', alignItems: 'center', margin: '0 auto', justifyContent:'center'}}>
                {chartType === 'bar' ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <Doughnut data={donutData} options={donutOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;