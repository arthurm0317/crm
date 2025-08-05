import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChatViewModal from './Componentes/ChatViewModal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

function NewDashboard({ theme }) {
  const url = process.env.REACT_APP_URL;
  const userData = JSON.parse(localStorage.getItem('user'));
  const schema = userData.schema;

  // Estados principais
  const [users, setUsers] = useState([]);
  const [closedChats, setClosedChats] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [activeChats] = useState([]);
  const [queues, setQueues] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [queueMap, setQueueMap] = useState({});
  const [showChatModal, setShowChatModal] = useState(false);
  const [modalChatId, setModalChatId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Estados de filtros
  const [selectedPeriod, setSelectedPeriod] = useState('diario');
  const [selectedSector, setSelectedSector] = useState('todos');
  const [selectedChannel, setSelectedChannel] = useState('todos');

  // Estados de dados calculados
  const [kpis, setKpis] = useState({
    conversionRate: 0,
    avgResolutionTime: 0,
    totalVolume: 0,
    slaCompliance: 0
  });

  const [liveOps, setLiveOps] = useState({
    onlineUsers: 0,
    activeQueues: 0,
    activeChats: 0,
    avgResponseTime: 0
  });

  const [performance, setPerformance] = useState({
    hourlyVolume: [],
    userRanking: [],
    channelDistribution: [],
    conversionByChannel: []
  });

  const [quality] = useState({
    accuracyIndex: 0,
    frequentCategories: [],
    successPatterns: [],
    followUpRate: 0
  });

  // Mapeamento de status para nomes legíveis
  const statusMapping = {
    'converted': 'Venda Fechada',
    'no_interest': 'Sem Interesse',
    'open': 'Em Andamento',
    'closed': 'Encerrada',
    'pending': 'Follow-up Pendente',
    'success': 'Sucesso',
    'failed': 'Perdido'
  };

  // Função para obter nome legível do status
  const getStatusLabel = (status) => {
    return statusMapping[status] || status;
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const colorMap = {
      'converted': 'success',
      'success': 'success',
      'no_interest': 'secondary',
      'open': 'primary',
      'pending': 'warning',
      'failed': 'danger',
      'closed': 'info'
    };
    return colorMap[status] || 'secondary';
  };

  // Função para obter ícone do status
  const getStatusIcon = (status) => {
    const iconMap = {
      'converted': 'bi-check-circle',
      'success': 'bi-check-circle',
      'no_interest': 'bi-slash-circle',
      'open': 'bi-chat-dots',
      'pending': 'bi-clock',
      'failed': 'bi-x-circle',
      'closed': 'bi-check-circle'
    };
    return iconMap[status] || 'bi-info-circle';
  };

  // Função para filtrar dados por período
  const filterDataByPeriod = (data) => {
    const now = new Date();
    const periodMap = {
      'diario': 1,
      'semanal': 7,
      'mensal': 30
    };
    const days = periodMap[selectedPeriod] || 1;
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return data.filter(item => {
      const itemDate = new Date(item.created_at || item.closed_at || now);
      return itemDate >= cutoffDate;
    });
  };

  // Função para filtrar dados por setor
  const filterDataBySector = (data) => {
    if (selectedSector === 'todos') return data;
    return data.filter(item => {
      const user = users.find(u => u.id === item.user_id);
      return user && user.setor === selectedSector;
    });
  };

  // Função para filtrar dados por canal
  const filterDataByChannel = (data) => {
    if (selectedChannel === 'todos') return data;
    return data.filter(item => {
      // Simular filtro por canal - implementar lógica real quando disponível
      return true;
    });
  };

  // Função para aplicar filtros globais
  const applyGlobalFilters = useCallback((data) => {
    let filteredData = data;
    filteredData = filterDataByPeriod(filteredData);
    filteredData = filterDataBySector(filteredData);
    filteredData = filterDataByChannel(filteredData);
    return filteredData;
  }, [selectedPeriod, selectedSector, selectedChannel, users]);

  // Carregar dados básicos
  useEffect(() => {
    const fetchBasicData = async () => {
      try {
        // Usuários
        const usersResponse = await axios.get(`${url}/api/users/${schema}`, {
          withCredentials: true
        });
        const usersData = usersResponse.data.users || [];
        setUsers(usersData);

        // Criar mapeamento de nomes de usuários
        const namesMap = {};
        usersData.forEach(user => {
          namesMap[user.id] = user.nome || user.username || user.name || `Usuário ${user.id}`;
        });
        setUserNames(namesMap);

        // Conversas fechadas
        const closedChatsResponse = await axios.get(`${url}/chat/get-closed-chats/${schema}`, {
          withCredentials: true
        });
        setClosedChats(closedChatsResponse.data.result || []);

        // Status
        const statusResponse = await axios.get(`${url}/chat/get-status/${schema}`, {
          withCredentials: true
        });
        setStatusList(statusResponse.data.result || []);

        // Filas
        const queuesResponse = await axios.get(`${url}/queue/get-all-queues/${schema}`, {
          withCredentials: true
        });
        const queuesData = queuesResponse.data.result || [];
        setQueues(queuesData);

        // Criar mapeamento de nomes de filas
        const queueNamesMap = {};
        queuesData.forEach(queue => {
          queueNamesMap[queue.id] = queue.name || `Fila ${queue.id}`;
        });
        setQueueMap(queueNamesMap);

        // Relatórios
        const reportsResponse = await axios.get(`${url}/report/get-reports/${schema}`, {
          params: { user_id: userData?.id, user_role: userData?.role },
          withCredentials: true
        });
        let reportsData = reportsResponse.data.result;
        if (typeof reportsData === 'string') {
          try { reportsData = JSON.parse(reportsData); } catch {}
        }
        if (!Array.isArray(reportsData)) reportsData = [reportsData];
        setReportData(reportsData);

        setLastUpdate(new Date());

      } catch (error) {
        console.error('Erro ao carregar dados básicos:', error);
      }
    };

    fetchBasicData();
  }, [schema, url, userData]);

  // Calcular KPIs com filtros aplicados
  useEffect(() => {
    if (closedChats.length > 0 && statusList.length > 0) {
      const filteredChats = applyGlobalFilters(closedChats);
      const statusSuccessMap = {};
      statusList.forEach(s => {
        statusSuccessMap[s.value] = s.success;
      });

      const ganhos = filteredChats.filter(c => statusSuccessMap[c.status] === true);
      const totalChats = filteredChats.length;
      const conversionRate = totalChats > 0 ? (ganhos.length / totalChats) * 100 : 0;

      // Calcular tempo médio de resolução
      const resolutionTimes = filteredChats
        .filter(c => c.closed_at && c.created_at)
        .map(c => {
          const closed = new Date(c.closed_at);
          const created = new Date(c.created_at);
          return (closed - created) / (1000 * 60); // em minutos
        });

      const avgResolutionTime = resolutionTimes.length > 0 
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
        : 0;

      setKpis({
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        totalVolume: totalChats,
        slaCompliance: 94 // Placeholder - implementar cálculo real
      });
    }
  }, [closedChats, statusList, selectedPeriod, selectedSector, selectedChannel, applyGlobalFilters]);

  // Calcular Live Ops com filtros aplicados
  useEffect(() => {
    const filteredUsers = applyGlobalFilters(users);
    const onlineUsers = filteredUsers.filter(u => u.online && u.permission === 'user').length;
    const activeQueues = queues.filter(q => q.active_chats > 0).length;
    
    setLiveOps({
      onlineUsers,
      activeQueues,
      activeChats: activeChats.length,
      avgResponseTime: 8 // Placeholder - implementar cálculo real
    });
  }, [users, queues, activeChats, selectedPeriod, selectedSector, selectedChannel, applyGlobalFilters]);

  // Calcular Performance com filtros aplicados
  useEffect(() => {
    if (closedChats.length > 0) {
      const filteredChats = applyGlobalFilters(closedChats);
      
      // Ranking de atendentes
      const userStats = {};
      filteredChats.forEach(chat => {
        if (chat.user_id) {
          userStats[chat.user_id] = (userStats[chat.user_id] || 0) + 1;
        }
      });

      const userRanking = Object.entries(userStats)
        .map(([userId, count]) => ({
          userId,
          name: userNames[userId] || `Usuário ${userId}`,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calcular conversão por canal
      const channelStats = {};
      const channelTotal = {};
      
      filteredChats.forEach(chat => {
        const channel = chat.channel || 'WhatsApp';
        if (!channelStats[channel]) {
          channelStats[channel] = 0;
          channelTotal[channel] = 0;
        }
        channelTotal[channel]++;
        if (chat.status === 'converted' || chat.status === 'success') {
          channelStats[channel]++;
        }
      });

      const conversionByChannel = ['WhatsApp', 'Webchat', 'Instagram'].map(channel => {
        const total = channelTotal[channel] || 0;
        const converted = channelStats[channel] || 0;
        return total > 0 ? Math.round((converted / total) * 100) : 0;
      });

      setPerformance(prev => ({
        ...prev,
        userRanking,
        conversionByChannel
      }));
    }
  }, [closedChats, userNames, selectedPeriod, selectedSector, selectedChannel, applyGlobalFilters]);

  // Função para abrir modal do chat
  const handleOpenChatModal = (chatId) => {
    setModalChatId(chatId);
    setShowChatModal(true);
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setModalChatId(null);
  };

  // Dados para gráficos com filtros aplicados
  const performanceChartData = {
    labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
    datasets: [{
      label: 'Volume por Hora',
      data: [12, 8, 15, 25, 18, 10],
      borderColor: theme === 'dark' ? 'rgb(75, 192, 192)' : 'rgb(75, 192, 192)',
      backgroundColor: theme === 'dark' ? 'rgba(75, 192, 192, 0.1)' : 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const channelDistributionData = {
    labels: ['WhatsApp', 'Webchat', 'Instagram'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['#25D366', '#007bff', '#E4405F'],
      borderColor: theme === 'dark' ? ['#1a1a1a', '#1a1a1a', '#1a1a1a'] : ['#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 2
    }]
  };

  // Função utilitária para renderizar tooltip react-bootstrap
  const renderTooltip = (msg) => (
    <Tooltip id={Math.random().toString().replace('.', '')} style={{ fontSize: '0.95em', maxWidth: 260 }}>
      {msg}
    </Tooltip>
  );

  return (
    <div className="pt-3" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CSS personalizado para filtros */}
      <style>
        {`
          .custom-select-${theme} {
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${theme === 'dark' ? '%23ffffff' : '%23000000'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 16px 12px;
            padding-right: 32px !important;
          }
          
          .custom-select-${theme}:hover {
            border-color: var(--primary-color) !important;
          }
          
          .custom-select-${theme}:focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            outline: none;
          }
          
          .kpi-tooltip {
            cursor: help;
            transition: all 0.2s ease;
          }
          
          .kpi-tooltip:hover {
            color: var(--primary-color) !important;
          }
          
          .kpi-tooltip-light {
            color: var(--color-light) !important;
            opacity: 0.75;
          }
          
          .kpi-tooltip-dark {
            color: var(--color-dark) !important;
            opacity: 0.5;
          }

          /* Garantir que tooltips apareçam */
          .tooltip {
            z-index: 9999 !important;
          }
          
          .tooltip-inner {
            max-width: 300px !important;
            background-color: ${theme === 'dark' ? '#333' : '#fff'} !important;
            color: ${theme === 'dark' ? '#fff' : '#000'} !important;
            border: 1px solid ${theme === 'dark' ? '#666' : '#ccc'} !important;
          }
          
          .tooltip.bs-tooltip-top .tooltip-arrow::before {
            border-top-color: ${theme === 'dark' ? '#333' : '#fff'} !important;
          }
          
          /* Estilos para gráficos Chart.js */
          .chart-container canvas {
            filter: ${theme === 'dark' ? 'brightness(0.9)' : 'brightness(1)'};
          }
          
          /* Garantir que as legendas dos gráficos respeitem o tema */
          .chartjs-legend {
            color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
          }
          
          /* Estilos para tooltips dos gráficos */
          .chartjs-tooltip {
            background-color: ${theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)'} !important;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
            border: 1px solid ${theme === 'dark' ? '#666' : '#ddd'} !important;
          }
          
          /* Estilos para eixos dos gráficos */
          .chartjs-axis-label {
            color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
          }
          
          /* Estilos para grades dos gráficos */
          .chartjs-grid-line {
            stroke: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
          }
          
          /* Estilos para bordas do gráfico de rosca */
          .chartjs-doughnut-border {
            stroke: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
            stroke-width: 2px !important;
          }
          
          /* Estilos para texto da coluna Próxima Etapa */
          .text-muted-${theme} {
            color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'} !important;
          }
          
          /* Estilos para o texto "Atualizado às" */
          .last-update-text {
            white-space: nowrap;
            flex-shrink: 0;
            min-width: fit-content;
          }
          
          /* Garantir que o container de filtros mantenha altura consistente */
          .filters-container {
            align-items: center;
            flex-wrap: nowrap;
            min-height: 38px;
          }
        `}
      </style>
      
      <div className="container-fluid ps-2 pe-0" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header com filtros e última atualização */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className={`header-text-${theme}`} style={{ fontWeight: 400 }}>Dashboard</h2>
          </div>
          <div className="d-flex align-items-center gap-3 filters-container">
            {/* Informação de última atualização */}
            <small className={`text-muted text-muted-${theme} last-update-text`}>
              <i className="bi bi-clock me-1"></i>
              Atualizado às {lastUpdate.toLocaleTimeString('pt-BR')}
            </small>
            
            {/* Filtros seguindo padrão do login */}
            <div className="input-group" style={{ minWidth: '140px' }}>
              <span className={`input-group-text igt-${theme}`}>
                <i className="bi bi-calendar3"></i>
              </span>
              <select 
                className={`form-control input-${theme} custom-select-${theme}`}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
            
            <div className="input-group" style={{ minWidth: '200px' }}>
              <span className={`input-group-text igt-${theme}`}>
                <i className="bi bi-building"></i>
              </span>
              <select 
                className={`form-control input-${theme} custom-select-${theme}`}
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os Setores</option>
                <option value="vendas">Vendas</option>
                <option value="suporte">Suporte</option>
              </select>
            </div>
            
            <div className="input-group" style={{ minWidth: '220px' }}>
              <span className={`input-group-text igt-${theme}`}>
                <i className="bi bi-phone"></i>
              </span>
              <select 
                className={`form-control input-${theme} custom-select-${theme}`}
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                style={{
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os Canais</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="webchat">Webchat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 1 - KPIs Estratégicos */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>KPIs Estratégicos</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row">
            <div className="col-3">
              <div className={`card card-${theme} p-3 text-center`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Taxa de Conversão
                    </h6>
                  </span>
                                      <OverlayTrigger placement="top" overlay={renderTooltip('Conversas marcadas como "ganho" sobre o total de conversas encerradas no período selecionado.')}>
                      <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                    </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{kpis.conversionRate}%</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up me-1"></i>
                  +5.2%
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className={`card card-${theme} p-3 text-center`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-clock me-2 text-primary"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Conformidade SLA
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Percentual de conversas encerradas dentro do tempo máximo permitido por setor.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{kpis.slaCompliance}%</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up me-1"></i>
                  +2.1%
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className={`card card-${theme} p-3 text-center`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-clock-history me-2 text-info"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Tempo Médio Resolução
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Tempo médio entre o início e o encerramento das conversas, mostrando a eficiência do atendimento no período selecionado.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{kpis.avgResolutionTime}min</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-down me-1"></i>
                  -2.1min
                </small>
              </div>
            </div>
            <div className="col-3">
              <div className={`card card-${theme} p-3 text-center`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-telephone me-2 text-info"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Volume Total
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Número total de conversas atendidas e finalizadas no período selecionado, independente do resultado.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{kpis.totalVolume}</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up me-1"></i>
                  +12%
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 - Live Ops */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>Monitoramento ao Vivo</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-people me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Atendentes Online
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Número atual de atendentes humanos disponíveis e ativos para receber novas conversas no momento.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="d-flex align-items-center">
                  <h3 className={`header-text-${theme} mb-0 me-2`}>{liveOps.onlineUsers}</h3>
                  <small className={`header-text-${theme}`}>/ {users.filter(u => u.permission === 'user').length}</small>
                </div>
                <div className="mt-2">
                  {users.filter(u => u.online && u.permission === 'user').slice(0, 3).map(user => (
                    <span key={user.id} className="badge bg-success me-1">
                      {user.nome || user.username}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-list-ul me-2 text-primary"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Filas Ativas
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Filas com pelo menos uma conversa em andamento.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{liveOps.activeQueues}</h3>
                <small className={`header-text-${theme}`}>filas com conversas</small>
              </div>
            </div>
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-chat-dots me-2 text-info"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Em Andamento</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Número de conversas que estão sendo atendidas atualmente, com tempo médio de resposta dos atendentes.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{liveOps.activeChats}</h3>
                <small className={`header-text-${theme}`}>Tempo médio: {liveOps.avgResponseTime}min</small>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3 - Performance */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>Performance e Produtividade</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-8">
              <div className={`card card-${theme} p-3`} style={{ height: '300px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-graph-up me-2 text-primary"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Volume por Hora</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Distribuição do volume de conversas ao longo das horas do dia, mostrando os horários de maior e menor movimento.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="chart-container" style={{ height: '220px', overflow: 'hidden' }}>
                  <Line data={performanceChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: theme === 'dark' ? '#fff' : '#000',
                        bodyColor: theme === 'dark' ? '#fff' : '#000'
                      }
                    },
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      },
                      x: {
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '300px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-trophy me-2 text-warning"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Ranking Atendentes</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Lista dos atendentes com maior número de conversas finalizadas no período selecionado, ordenados por produtividade.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div style={{ height: '220px', overflow: 'auto' }}>
                  {performance.userRanking.map((user, index) => (
                    <div key={user.userId} className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`header-text-${theme}`}>
                        {index === 0 && <i className="bi bi-award-fill text-warning me-1"></i>}
                        {index === 1 && <i className="bi bi-award-fill text-secondary me-1"></i>}
                        {index === 2 && <i className="bi bi-award-fill text-danger me-1"></i>}
                        {index > 2 && <i className="bi bi-circle me-1"></i>}
                        {user.name}
                      </span>
                      <span className={`badge bg-${index < 3 ? 'primary' : 'secondary'}`}>{user.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '250px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-bar-chart me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Conversão por Canal
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Taxa de sucesso (conversão) separada por canal de entrada, mostrando qual canal gera mais resultados positivos.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="chart-container" style={{ height: '180px', overflow: 'hidden' }}>
                  <Bar data={{
                    labels: ['WhatsApp', 'Webchat', 'Instagram'],
                    datasets: [{
                      label: 'Taxa de Conversão',
                      data: performance.conversionByChannel || [75, 60, 45],
                      backgroundColor: ['#25D366', '#007bff', '#E4405F']
                    }]
                  }} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: theme === 'dark' ? '#fff' : '#000',
                        bodyColor: theme === 'dark' ? '#fff' : '#000'
                      }
                    },
                    scales: { 
                      y: { 
                        beginAtZero: true, 
                        max: 100,
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      },
                      x: {
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '250px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-pie-chart me-2 text-info"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>
                      Distribuição por Canal
                    </h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Percentual de conversas por canal de origem, mostrando como o volume se distribui entre WhatsApp, Webchat e outros canais.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="chart-container" style={{ height: '180px', overflow: 'hidden' }}>
                  <Doughnut data={channelDistributionData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: theme === 'dark' ? '#fff' : '#000',
                        bodyColor: theme === 'dark' ? '#fff' : '#000'
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4 - Qualidade */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>Qualidade de Atendimento</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-check-circle me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Índice de Acerto</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Percentual de conversas onde o atendente conseguiu resolver o problema do cliente de forma satisfatória.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{quality.accuracyIndex}%</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up me-1"></i>
                  +3.2%
                </small>
              </div>
            </div>
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '120px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Tempo Médio (Mal Avaliadas)</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Tempo médio de resolução das conversas que receberam avaliação negativa ou baixa satisfação do cliente.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>12.5min</h3>
                <small className="text-danger">
                  <i className="bi bi-arrow-up me-1"></i>
                  +2.1min
                </small>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '150px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-folder me-2 text-primary"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Categorias Frequentes</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Principais tipos de demanda atendidos, mostrando as categorias que aparecem com maior frequência nas conversas.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="d-flex flex-column">
                  <span className={`mb-1 header-text-${theme}`}>Vendas: 45%</span>
                  <span className={`mb-1 header-text-${theme}`}>Suporte: 30%</span>
                  <span className={`mb-1 header-text-${theme}`}>Financeiro: 25%</span>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '150px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-check2-all me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Padrões de Sucesso</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Principais características das conversas bem-sucedidas, incluindo tempo de resposta, solução completa e follow-up realizado.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="d-flex flex-column">
                  <span className={`mb-1 header-text-${theme}`}>Resposta rápida: 85%</span>
                  <span className={`mb-1 header-text-${theme}`}>Solução completa: 78%</span>
                  <span className={`mb-1 header-text-${theme}`}>Follow-up: 62%</span>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card card-${theme} p-3`} style={{ height: '150px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-telephone me-2 text-info"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>% Follow-ups</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Percentual de conversas onde foi realizado o acompanhamento posterior (follow-up) para garantir a satisfação do cliente.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <h3 className={`header-text-${theme} mb-1`}>{quality.followUpRate}%</h3>
                <small className="text-success">
                  <i className="bi bi-arrow-up me-1"></i>
                  +8.5%
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4.5 - Motivos de Ganho e Perda */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>Motivos de Ganho e Perda</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '300px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-check-circle me-2 text-success"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Motivos de Ganho</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Principais motivos que levaram ao fechamento positivo das conversas, mostrando os fatores de sucesso.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="chart-container" style={{ height: '220px', overflow: 'hidden' }}>
                  <Bar data={{
                    labels: ['Preço competitivo', 'Produto adequado', 'Atendimento excelente', 'Urgência do cliente', 'Outros'],
                    datasets: [{
                      label: 'Ganhos',
                      data: [35, 25, 20, 15, 5],
                      backgroundColor: '#28a745'
                    }]
                  }} options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: theme === 'dark' ? '#fff' : '#000',
                        bodyColor: theme === 'dark' ? '#fff' : '#000'
                      }
                    },
                    scales: { 
                      x: { 
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      },
                      y: {
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className={`card card-${theme} p-3`} style={{ height: '300px', overflow: 'hidden' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-x-circle me-2 text-danger"></i>
                    <h6 className={`card-subtitle-${theme} mb-0`}>Motivos de Perda</h6>
                  </span>
                  <OverlayTrigger placement="top" overlay={renderTooltip('Principais motivos que levaram ao fechamento negativo das conversas, mostrando os pontos de melhoria.')}>
                    <i className={`bi bi-question-circle ms-1 kpi-tooltip kpi-tooltip-${theme}`}></i>
                  </OverlayTrigger>
                </div>
                <div className="chart-container" style={{ height: '220px', overflow: 'hidden' }}>
                  <Bar data={{
                    labels: ['Sem interesse', 'Sem método pagamento', 'Valor alto', 'Concorrência', 'Outros'],
                    datasets: [{
                      label: 'Perdas',
                      data: [40, 25, 20, 10, 5],
                      backgroundColor: '#dc3545'
                    }]
                  }} options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: theme === 'dark' ? '#fff' : '#000',
                        bodyColor: theme === 'dark' ? '#fff' : '#000'
                      }
                    },
                    scales: { 
                      x: { 
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      },
                      y: {
                        grid: {
                          color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 5 - Histórico e Drilldown */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className={`header-text-${theme} mb-0`}>Histórico de Conversas</h5>
            <div className="flex-grow-1 ms-3">
              <hr className={`border-${theme}`} />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className={`card card-${theme} p-3`}>
                <div className={`table-responsive custom-table-${theme}`}>
                  <table className={`table table-bordered table-hover m-0 table-${theme}`}>
                    <thead className={`table-${theme}`}>
                      <tr>
                        <th><i className="bi bi-calendar me-1"></i>Data</th>
                        <th><i className="bi bi-phone me-1"></i>Canal</th>
                        <th><i className="bi bi-list-ul me-1"></i>Fila</th>
                        <th><i className="bi bi-person me-1"></i>Atendente</th>
                        <th><i className="bi bi-tag me-1"></i>Categoria</th>
                        <th><i className="bi bi-info-circle me-1"></i>Status</th>
                        <th><i className="bi bi-chat-text me-1"></i>Resumo</th>
                        <th><i className="bi bi-arrow-right me-1"></i>Próxima Etapa</th>
                        <th><i className="bi bi-gear me-1 d-flex justify-content-center"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.length === 0 && (
                        <tr><td colSpan={9} className="text-center">Nenhum dado encontrado</td></tr>
                      )}
                      {reportData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? `table-light-${theme}` : ''}>
                          <td>{new Date().toLocaleDateString('pt-BR')}</td>
                          <td>WhatsApp</td>
                          <td>{row.queue_id ? (queueMap[row.queue_id] || `Fila ${row.queue_id}`) : '-'}</td>
                          <td>{row.user_id ? (userNames[row.user_id] || `Usuário ${row.user_id}`) : '-'}</td>
                          <td>{row.categoria || '-'}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(row.status)}`}>
                              <i className={`${getStatusIcon(row.status)} me-1`}></i>
                              {getStatusLabel(row.status)}
                            </span>
                          </td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id={`tooltip-resumo-${idx}`}>{row.resumo || 'Sem resumo disponível'}</Tooltip>}
                            >
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                                {row.resumo ? (row.resumo.length > 30 ? row.resumo.substring(0, 30) + '...' : row.resumo) : '-'}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td className={`table-light-${theme}`}>
                            <span className="text-truncate d-inline-block">
                              {row.proxima_etapa_recomendada || 'Não definida'}
                            </span>
                          </td>
                          <td className="d-flex justify-content-center border-0">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleOpenChatModal(row.chat_id)}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Visualizar conversa"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de visualização do chat */}
      <ChatViewModal
        show={showChatModal}
        onClose={handleCloseChatModal}
        theme={theme}
        chatId={modalChatId}
        schema={schema}
        url={url}
      />
    </div>
  );
}

export default NewDashboard;