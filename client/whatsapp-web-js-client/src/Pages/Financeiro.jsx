import React, { useState, useEffect } from 'react';
import * as bootstrap from 'bootstrap';
import DespesaModal from './modalPages/DespesaModal';
import TaxRateModal from './modalPages/TaxRateModal';
import { ExpensesService, CategoriesService, VendorsService, TaxRatesService } from '../services/FinanceiroService';
import { useToast } from '../contexts/ToastContext';

function Financeiro({ theme }) {
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState('resumo');
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);
  const [showTaxRateModal, setShowTaxRateModal] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    categorizada: ''
  });

  // Obter schema do usuário logado
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const schema = user.schema 

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
      const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
      
      return () => {
        tooltipList.forEach(tooltip => {
          if (tooltip && tooltip._element) {
            tooltip.dispose();
          }
        });
      };
    }
  }, [activeTab]);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        // Carregar despesas
        const expensesResponse = await ExpensesService.getExpenses(schema);
        if (expensesResponse.success) {
          setDespesas(expensesResponse.data || []);
        }

        // Carregar categorias
        const categoriesResponse = await CategoriesService.getCategories(schema);
        if (categoriesResponse.success) {
          setCategorias(categoriesResponse.data || []);
        }

        // Carregar fornecedores
        const vendorsResponse = await VendorsService.getVendors(schema);
        if (vendorsResponse.success) {
          setFornecedores(vendorsResponse.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [schema]);



  // Funções de gestão de despesas
  const handleNovaDespesa = () => {
    setDespesaEditando(null);
    setShowDespesaModal(true);
  };

  const handleEditarDespesa = (despesa) => {
    setDespesaEditando(despesa);
    setShowDespesaModal(true);
  };

  const handleSalvarDespesa = async (despesa) => {
    try {
      setLoading(true);
      console.log(despesa)
      // Preparar dados para a API
      const expenseData = {
        user_id: user.id,
        vendor_id: despesa.fornecedor_id || null,
        description: despesa.descricao,
        category_id: despesa.categoria_id || null,
        total_amount: parseFloat(despesa.valor) || 0,
        currency: 'BRL',
        date_incurred: despesa.data,
        due_date: despesa.dataVencimento || null,
        payment_date: despesa.dataPagamento || null,
        payment_method: despesa.metodoPagamento || 'dinheiro',
        status: despesa.status || 'pendente',
        created_at: new Date().toISOString(),
        itens: despesa.itens,
        schema: schema
      };

      if (despesaEditando) {
        // Atualizar despesa existente (implementar quando tiver endpoint de update)
        setDespesas(prev => prev.map(d => d.id === despesa.id ? despesa : d));
      } else {
        // Criar nova despesa
        const response = await ExpensesService.createExpense(expenseData);
        if (response.success) {
          setDespesas(prev => [...prev, response.data]);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      showError('Erro ao salvar despesa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirDespesa = (despesaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setDespesas(prev => prev.filter(d => d.id !== despesaId));
    }
  };

  // Funções de callback para atualizar listas quando novos itens são criados
  const handleCategoryCreated = (newCategory) => {
    setCategorias(prev => [...prev, newCategory]);
  };

  const handleVendorCreated = (newVendor) => {
    setFornecedores(prev => [...prev, newVendor]);
  };

  const handleTaxRateCreated = (newTaxRate) => {
    // Atualizar a lista de impostos se necessário
    console.log('Novo imposto criado:', newTaxRate);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const despesasFiltradas = despesas.filter(despesa => {
    const matchBusca = !filtros.busca || 
      despesa.description?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      despesa.vendor_name?.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchCategoria = !filtros.categoria || despesa.category_name === filtros.categoria;
    const matchStatus = !filtros.status || despesa.status === filtros.status;
    const matchCategorizada = !filtros.categorizada || 
      (filtros.categorizada === 'categorizada' && despesa.category_name) ||
      (filtros.categorizada === 'nao_categorizada' && !despesa.category_name);
    
    const matchData = (!filtros.dataInicio || despesa.date_incurred >= filtros.dataInicio) &&
                     (!filtros.dataFim || despesa.date_incurred <= filtros.dataFim);
    
    return matchBusca && matchCategoria && matchStatus && matchCategorizada && matchData;
  });

  // Funções de exportação
  const exportarCSV = () => {
    const headers = ['ID', 'Descrição', 'Valor', 'Categoria', 'Data', 'Fornecedor', 'Status', 'Valor Total'];
    const csvContent = [
      headers.join(','),
      ...despesasFiltradas.map(d => [
        d.id,
        `"${d.description}"`,
        d.total_amount,
        d.category_name || 'Não categorizada',
        d.date_incurred,
        `"${d.vendor_name || ''}"`,
        d.status,
        d.total_amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `despesas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportarExcel = () => {
    // Simulação de exportação Excel (usando CSV como base)
    exportarCSV();
  };

  const exportarPDF = () => {
    // Simulação de exportação PDF
    const conteudo = despesasFiltradas.map(d => 
      `${d.description} - R$ ${d.total_amount} - ${d.date_incurred}`
    ).join('\n');
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `despesas_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const calcularTotais = () => {
    const totais = despesasFiltradas.reduce((acc, despesa) => {
      const valorDespesa = parseFloat(despesa.total_amount) || 0;
      
      return {
        total: acc.total + valorDespesa,
        base: acc.base + valorDespesa,
        impostos: acc.impostos + 0, // Impostos não implementados na API ainda
        categorizadas: acc.categorizadas + (despesa.category_name ? valorDespesa : 0),
        naoCategorizadas: acc.naoCategorizadas + (!despesa.category_name ? valorDespesa : 0)
      };
    }, { total: 0, base: 0, impostos: 0, categorizadas: 0, naoCategorizadas: 0 });

    return totais;
  };

  // Função para simular despesas vindas do WhatsApp (não categorizadas)
  const simularDespesaWhatsApp = () => {
    const despesaWhatsApp = {
      id: Date.now(),
      descricao: 'Despesa recebida via WhatsApp',
      valor: '150.00',
      categoria: '', // Não categorizada
      data: new Date().toISOString().split('T')[0],
      fornecedor: 'Fornecedor via WhatsApp',
      observacoes: 'Documento anexado via WhatsApp',
      status: 'pendente',
             documentos: [
         {
           id: Date.now(),
           nome: 'documento_whatsapp.pdf',
           tipo: 'application/pdf',
           tamanho: 1024000,
           dataUpload: new Date().toISOString(),
           valorSugerido: '150.00',
           origem: 'whatsapp'
         }
       ],
      impostos: [],
      itens: [],
      dataCriacao: new Date().toISOString(),
      dataModificacao: new Date().toISOString(),
      totalImpostos: 0,
      totalItens: 0,
      valorTotal: 150.00,
      origem: 'whatsapp'
    };

    setDespesas(prev => [...prev, despesaWhatsApp]);
  };

  // Função para simular despesa com impostos
  const simularDespesaComImpostos = () => {
    const despesaComImpostos = {
      id: Date.now() + 1,
      descricao: 'Despesa com impostos',
      valor: '250.00',
      categoria: 'Serviços',
      data: new Date().toISOString().split('T')[0],
      fornecedor: 'Fornecedor com impostos',
      observacoes: 'Despesa com impostos para teste',
      status: 'pendente',
      documentos: [
        {
          id: Date.now() + 1,
          nome: 'nota_fiscal.pdf',
          tipo: 'application/pdf',
          tamanho: 1024000,
          dataUpload: new Date().toISOString(),
          valorSugerido: '250.00',
          origem: 'manual'
        }
      ],
      impostos: [
        {
          id: Date.now() + 2,
          tipo: 'ICMS',
          aliquota: 18,
          valorCalculado: 45.00,
          aplicacao: 'total',
          valorBase: 250.00
        },
        {
          id: Date.now() + 3,
          tipo: 'PIS',
          aliquota: 1.65,
          valorCalculado: 4.13,
          aplicacao: 'total',
          valorBase: 250.00
        }
      ],
      itens: [
        {
          id: Date.now() + 4,
          nome: 'Serviço de consultoria',
          valor: 200.00,
          quantidade: 1,
          observacoes: 'Serviço prestado'
        },
        {
          id: Date.now() + 5,
          nome: 'Material de escritório',
          valor: 50.00,
          quantidade: 1,
          observacoes: 'Material utilizado'
        }
      ],
      dataCriacao: new Date().toISOString(),
      dataModificacao: new Date().toISOString(),
      totalImpostos: 49.13,
      totalItens: 250.00,
      valorTotal: 299.13,
      origem: 'manual'
    };

    setDespesas(prev => [...prev, despesaComImpostos]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumo':
        return (
          <div className="p-4">
            <h4 className={`header-text-${theme} mb-3`}>Resumo Financeiro</h4>
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cash-coin text-success" style={{ fontSize: '2rem' }}></i>
                    <div className="ms-3">
                      <h6 className={`card-subtitle-${theme} mb-1`}>Receitas do Mês</h6>
                      <h4 className={`header-text-${theme} mb-0`}>R$ 0,00</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cart-x text-danger" style={{ fontSize: '2rem' }}></i>
                    <div className="ms-3">
                      <h6 className={`card-subtitle-${theme} mb-1`}>Despesas do Mês</h6>
                      <h4 className={`header-text-${theme} mb-0`}>R$ 0,00</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-graph-up text-primary" style={{ fontSize: '2rem' }}></i>
                    <div className="ms-3">
                      <h6 className={`card-subtitle-${theme} mb-1`}>Saldo</h6>
                      <h4 className={`header-text-${theme} mb-0`}>R$ 0,00</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className={`card card-${theme} p-3`}>
                  <h5 className={`header-text-${theme} mb-3`}>Gráfico de Fluxo de Caixa</h5>
                  <div className="text-center p-4">
                    <i className="bi bi-bar-chart" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p className={`text-${theme === 'light' ? 'muted' : 'light'} mt-2`}>Gráfico será implementado em breve</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'despesas':
        return (
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className={`header-text-${theme} mb-0`}>Gestão de Despesas</h4>
              <div className="d-flex gap-2">
                <button className={`btn btn-2-${theme}`} onClick={simularDespesaWhatsApp}>
                  <i className="bi bi-whatsapp me-2"></i>
                  Simular WhatsApp
                </button>
                <button className={`btn btn-2-${theme}`} onClick={simularDespesaComImpostos}>
                  <i className="bi bi-calculator me-2"></i>
                  Simular com Impostos
                </button>
                <button className={`btn btn-2-${theme}`} onClick={() => setShowTaxRateModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Novo Imposto
                </button>
                <button className={`btn btn-1-${theme}`} onClick={handleNovaDespesa}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Nova Despesa
                </button>
              </div>
            </div>
            
                         {/* Cards de métricas */}
             <div className="row mb-3">
               <div className="col-md-4">
                 <div className={`card card-${theme} p-3`}>
                   <div className="row">
                                          <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-tag" style={{ fontSize: '1.5rem', color: `var(--primary-color)` }}></i>
                          <div className="ms-2">
                            <h6 className={`card-subtitle-${theme} mb-0`}>Categorizadas</h6>
                            <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().categorizadas.toFixed(2)}</h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-6" style={{ borderLeft: `1px solid var(--border-color-${theme})` }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-question-circle" style={{ fontSize: '1.5rem', color: `var(--primary-color)` }}></i>
                          <div className="ms-2">
                            <h6 className={`card-subtitle-${theme} mb-0`}>Não Categorizadas</h6>
                            <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().naoCategorizadas.toFixed(2)}</h5>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>
               </div>
                              <div className="col-md-2">
                  <div className={`card card-${theme} p-3`}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar-event" style={{ fontSize: '1.5rem', color: `var(--primary-color)` }}></i>
                      <div className="ms-2">
                        <h6 className={`card-subtitle-${theme} mb-0`}>Este Mês</h6>
                        <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().total.toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className={`card card-${theme} p-3`}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar-day" style={{ fontSize: '1.5rem', color: `var(--primary-color)` }}></i>
                      <div className="ms-2">
                        <h6 className={`card-subtitle-${theme} mb-0`}>Hoje</h6>
                        <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().total.toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                </div>
               <div className="col-md-2">
                 <div className={`card card-${theme} p-3`}>
                   <div className="d-flex align-items-center">
                     <i className="bi bi-calculator text-danger" style={{ fontSize: '1.5rem' }}></i>
                     <div className="ms-2">
                       <h6 className={`card-subtitle-${theme} mb-0`}>Impostos</h6>
                       <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().impostos.toFixed(2)}</h5>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="col-md-2">
                 <div className={`card card-${theme} p-3`}>
                   <div className="d-flex align-items-center">
                     <i className="bi bi-cart-x text-danger" style={{ fontSize: '1.5rem' }}></i>
                     <div className="ms-2">
                       <h6 className={`card-subtitle-${theme} mb-0`}>Total</h6>
                       <h5 className={`header-text-${theme} mb-0`}>R$ {calcularTotais().total.toFixed(2)}</h5>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

                         {/* Filtros avançados */}
             <div className={`card card-${theme} mb-3`}>
               <div className="card-header">
                 <h6 className={`header-text-${theme} mb-0`}>Filtros</h6>
               </div>
               <div className={`card-body bg-form-${theme}`}>
                <div className="row">
                                     <div className="col-md-3 mb-2">
                     <input 
                       type="text" 
                       className={`form-control input-${theme}`}
                       placeholder="Buscar despesas..."
                       value={filtros.busca}
                       onChange={(e) => handleFiltroChange('busca', e.target.value)}
                     />
                   </div>
                                     <div className="col-md-2 mb-2">
                                         <select 
                      className={`form-select input-${theme}`}
                      value={filtros.categoria}
                      onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                    >
                      <option value="">Todas as Categorias</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.name}>
                          {categoria.name}
                        </option>
                      ))}
                    </select>
                   </div>
                   <div className="col-md-2 mb-2">
                     <select 
                       className={`form-select input-${theme}`}
                       value={filtros.status}
                       onChange={(e) => handleFiltroChange('status', e.target.value)}
                     >
                       <option value="">Todos os Status</option>
                       <option value="pendente">Pendente</option>
                       <option value="pago">Pago</option>
                       <option value="cancelado">Cancelado</option>
                     </select>
                   </div>
                   <div className="col-md-2 mb-2">
                     <select 
                       className={`form-select input-${theme}`}
                       value={filtros.categorizada}
                       onChange={(e) => handleFiltroChange('categorizada', e.target.value)}
                     >
                       <option value="">Todas</option>
                       <option value="categorizada">Categorizadas</option>
                       <option value="nao_categorizada">Não Categorizadas</option>
                     </select>
                   </div>
                  <div className="col-md-3 mb-2">
                    <div className="row">
                                             <div className="col-6">
                                                    <input 
                             type="date" 
                             className={`form-control input-${theme}`}
                             placeholder="Data início"
                             value={filtros.dataInicio}
                             onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                           />
                       </div>
                       <div className="col-6">
                                                    <input 
                             type="date" 
                             className={`form-control input-${theme}`}
                             placeholder="Data fim"
                             value={filtros.dataFim}
                             onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                           />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de despesas */}
            <div className={`card card-${theme}`}>
              <div className="card-header d-flex justify-content-between align-items-center" style={{ padding: '16px 20px' }}>
                <div className="d-flex align-items-center">
                  <h5 className={`header-text-${theme} mb-0`}>
                    Lista de Despesas ({despesasFiltradas.length})
                  </h5>
                  {loading && (
                    <div className="ms-2">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="dropdown">
                    <button className={`btn btn-sm btn-2-${theme} dropdown-toggle`} type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-download me-1"></i>
                      Exportar
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-${theme}`}>
                      <li><button className="dropdown-item" onClick={exportarCSV}>CSV</button></li>
                      <li><button className="dropdown-item" onClick={exportarExcel}>Excel</button></li>
                      <li><button className="dropdown-item" onClick={exportarPDF}>PDF</button></li>
                    </ul>
                  </div>
                                     <div className={`card card-${theme} py-2 px-3 gap-2`} style={{ minWidth: '150px' }}>
                     <div className="d-flex align-items-center justify-content-between gap-3">
                       <small className={`text-${theme === 'light' ? 'muted' : 'light'}`} style={{ fontSize: '1rem', fontWeight: '500' }}>
                         Total
                       </small>
                       <div className={`header-text-${theme}`} style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                         R$ {calcularTotais().total.toFixed(2)}
                       </div>
                     </div>
                   </div>
                </div>
              </div>
              <div className="card-body p-0">
                {despesasFiltradas.length > 0 ? (
                  <div className="table-responsive">
                                         <table className={`table custom-table-${theme} mb-0`}>
                                                                                                                          <thead>
                            <tr>
                              <th className={`header-text-${theme}`} style={{ width: '12%' }}>Data</th>
                              <th className={`header-text-${theme}`} style={{ width: '25%' }}>Descrição</th>
                              <th className={`header-text-${theme}`} style={{ width: '10%', textAlign: 'center' }}>Status</th>
                              <th className={`header-text-${theme}`} style={{ width: '12%', textAlign: 'center' }}>Categoria</th>
                              <th className={`header-text-${theme}`} style={{ width: '15%', textAlign: 'center' }}>Documentos</th>
                              <th className={`header-text-${theme}`} style={{ width: '15%' }}>Valor</th>
                              <th className={`header-text-${theme}`} style={{ width: '11%', textAlign: 'center' }}>Ações</th>
                            </tr>
                          </thead>
                         <tbody>
                                                       {despesasFiltradas.map((despesa, index) => (
                              <tr key={despesa.id}>
                                <td className={`text-${theme === 'light' ? 'dark' : 'light'}`}>
                                  {new Date(despesa.date_incurred).toLocaleDateString('pt-BR')}
                                </td>
                                <td>
                                 <div>
                                   <strong className={`header-text-${theme}`}>{despesa.description}</strong>
                                   {despesa.vendor_name && (
                                     <small className={`text-${theme === 'light' ? 'muted' : 'light'} d-block`}>
                                       {despesa.vendor_name}
                                     </small>
                                   )}
                                 </div>
                               </td>
                                                                                               <td style={{ textAlign: 'center' }}>
                                   <span className={`badge bg-${
                                     despesa.status === 'pago' ? 'success' : 
                                     despesa.status === 'pendente' ? 'warning' : 'danger'
                                   }`} style={{ 
                                     textTransform: 'capitalize',
                                     fontWeight: '500',
                                     fontSize: '0.8rem',
                                     padding: '6px 10px'
                                   }}>
                                     {despesa.status}
                                   </span>
                                 </td>
                                                                 <td style={{ textAlign: 'center' }}>
                                   {despesa.category_name ? (
                                     <span className={`badge bg-success`}>{despesa.category_name}</span>
                                   ) : (
                                     <span className={`badge bg-warning`}>Não categorizada</span>
                                   )}
                                 </td>
                                <td style={{ textAlign: 'center' }}>
                                   <div className="d-flex align-items-center justify-content-center gap-1">
                                     {despesa.documentos && despesa.documentos.length > 0 && (
                                       <span className="badge bg-info">
                                         <i className="bi bi-file-earmark me-1"></i>
                                         {despesa.documentos.length}
                                       </span>
                                     )}
                                     {despesa.documentos && despesa.documentos.some(doc => doc.valorSugerido) && (
                                       <span className="badge bg-warning" title="Valor sugerido dos documentos">
                                         <i className="bi bi-currency-dollar me-1"></i>
                                         R$ {despesa.documentos.reduce((total, doc) => total + (parseFloat(doc.valorSugerido) || 0), 0).toFixed(2)}
                                       </span>
                                     )}
                                     {despesa.origem === 'whatsapp' && (
                                       <span className="badge bg-success" title="Recebida via WhatsApp">
                                         <i className="bi bi-whatsapp"></i>
                                       </span>
                                     )}
                                     {!despesa.documentos?.length && despesa.origem !== 'whatsapp' && (
                                       <span className={`text-${theme === 'light' ? 'muted' : 'light'}`}>-</span>
                                     )}
                                   </div>
                                 </td>
                                                               <td>
                                  <div>
                                    <strong className={`text-${theme === 'light' ? 'dark' : 'light'}`}>
                                      R$ {parseFloat(despesa.total_amount || 0).toFixed(2)}
                                    </strong>
                                  </div>
                                </td>
                                                               <td style={{ textAlign: 'center' }}>
                                   <button
                                     className={`icon-btn btn-2-${theme} btn-user`}
                                     data-bs-toggle="tooltip"
                                     title="Editar"
                                     onClick={() => handleEditarDespesa(despesa)}
                                   >
                                     <i className="bi bi-pencil-fill"></i>
                                   </button>
   
                                   <button
                                     className="icon-btn text-danger"
                                     data-bs-toggle="tooltip"
                                     title="Excluir"
                                     onClick={() => handleExcluirDespesa(despesa.id)}
                                   >
                                     <i className="bi bi-trash-fill"></i>
                                   </button>
                                 </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <i className="bi bi-receipt" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p className={`text-${theme === 'light' ? 'muted' : 'light'} mt-2`}>
                      {despesas.length === 0 ? 'Nenhuma despesa registrada' : 'Nenhuma despesa encontrada com os filtros aplicados'}
                    </p>
                    {despesas.length === 0 && (
                      <button className={`btn btn-1-${theme}`} onClick={handleNovaDespesa}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Adicionar Primeira Despesa
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'receitas':
        return (
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className={`header-text-${theme} mb-0`}>Gestão de Receitas</h4>
              <div className="d-flex gap-2">
                <button className={`btn btn-2-${theme}`} onClick={() => setShowTaxRateModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Novo Imposto
                </button>
                <button className={`btn btn-1-${theme}`}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Nova Receita
                </button>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cash-coin text-success" style={{ fontSize: '1.5rem' }}></i>
                    <div className="ms-2">
                      <h6 className={`card-subtitle-${theme} mb-0`}>Total Receitas</h6>
                      <h5 className={`header-text-${theme} mb-0`}>R$ 0,00</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-event text-info" style={{ fontSize: '1.5rem' }}></i>
                    <div className="ms-2">
                      <h6 className={`card-subtitle-${theme} mb-0`}>Este Mês</h6>
                      <h5 className={`header-text-${theme} mb-0`}>R$ 0,00</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-week text-warning" style={{ fontSize: '1.5rem' }}></i>
                    <div className="ms-2">
                      <h6 className={`card-subtitle-${theme} mb-0`}>Esta Semana</h6>
                      <h5 className={`header-text-${theme} mb-0`}>R$ 0,00</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card card-${theme} p-3`}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-day text-success" style={{ fontSize: '1.5rem' }}></i>
                    <div className="ms-2">
                      <h6 className={`card-subtitle-${theme} mb-0`}>Hoje</h6>
                      <h5 className={`header-text-${theme} mb-0`}>R$ 0,00</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`card card-${theme}`}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className={`header-text-${theme} mb-0`}>Lista de Receitas</h5>
                <div className="d-flex gap-2">
                  <input 
                    type="text" 
                    className={`form-control form-control-${theme}`}
                    placeholder="Buscar receitas..."
                    style={{ width: '200px' }}
                  />
                  <select className={`form-select form-select-${theme}`} style={{ width: '150px' }}>
                    <option>Todas as Categorias</option>
                    <option>Vendas</option>
                    <option>Serviços</option>
                    <option>Investimentos</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div className="card-body">
                <div className="text-center p-4">
                  <i className="bi bi-cash-stack" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  <p className={`text-${theme === 'light' ? 'muted' : 'light'} mt-2`}>Nenhuma receita registrada</p>
                  <button className={`btn btn-1-${theme}`}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Adicionar Primeira Receita
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-3" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="container-fluid ps-2 pe-0" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 className={`mb-3 ms-3 header-text-${theme}`} style={{ fontWeight: 400 }}>Financeiro</h2>
        <ul 
          className="nav nav-tabs ps-3"
          style={{
            borderBottom: 'none',
          }}
        >
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === 'resumo' ? ' active' : ''}`}
              onClick={() => setActiveTab('resumo')}
              type="button"
              style={{
                transition: 'var(--TT) all',
                backgroundColor: 'transparent',
                border: `1px solid var(--border-color-${theme})`,
                borderTop: activeTab === 'resumo' ? `1px solid var(--primary-color)` : `1px solid var(--border-color-${theme})`,
                position: 'relative',
                paddingTop: activeTab === 'resumo' ? '0.5rem' : undefined,
                color: `var(--color-${theme})`,
                fontWeight: activeTab === 'resumo' ? 600 : 400,
                outline: 'none'
              }}
              onFocus={e => e.currentTarget.style.transition = 'var(--TT) all'}
              onBlur={e => e.currentTarget.style.transition = 'var(--TT) all'}
            >
              {activeTab === 'resumo' && (
                <span
                  style={{
                    transition: 'var(--TT) all',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '0',
                    borderTop: '5px solid var(--primary-color)',
                    borderRadius: '6px 6px 0 0',
                    pointerEvents: 'none',
                  }}
                ></span>
              )}
              Resumo
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === 'despesas' ? ' active' : ''}`}
              onClick={() => setActiveTab('despesas')}
              type="button"
              style={{
                transition: 'var(--TT) all',
                backgroundColor: 'transparent',
                border: `1px solid var(--border-color-${theme})`,
                borderTop: activeTab === 'despesas' ? `1px solid var(--primary-color)` : `1px solid var(--border-color-${theme})`,
                position: 'relative',
                paddingTop: activeTab === 'despesas' ? '0.5rem' : undefined,
                color: `var(--color-${theme})`,
                fontWeight: activeTab === 'despesas' ? 600 : 400,
                outline: 'none'
              }}
              onFocus={e => e.currentTarget.style.transition = 'var(--TT) all'}
              onBlur={e => e.currentTarget.style.transition = 'var(--TT) all'}
            >
              {activeTab === 'despesas' && (
                <span
                  style={{
                    transition: 'var(--TT) all',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '0',
                    borderTop: '5px solid var(--primary-color)',
                    borderRadius: '6px 6px 0 0',
                    pointerEvents: 'none',
                  }}
                ></span>
              )}
              Despesas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === 'receitas' ? ' active' : ''}`}
              onClick={() => setActiveTab('receitas')}
              type="button"
              style={{
                transition: 'var(--TT) all',
                backgroundColor: 'transparent',
                border: `1px solid var(--border-color-${theme})`,
                borderTop: activeTab === 'receitas' ? `1px solid var(--primary-color)` : `1px solid var(--border-color-${theme})`,
                position: 'relative',
                paddingTop: activeTab === 'receitas' ? '0.5rem' : undefined,
                color: `var(--color-${theme})`,
                fontWeight: activeTab === 'receitas' ? 600 : 400,
                outline: 'none'
              }}
              onFocus={e => e.currentTarget.style.transition = 'var(--TT) all'}
              onBlur={e => e.currentTarget.style.transition = 'var(--TT) all'}
            >
              {activeTab === 'receitas' && (
                <span
                  style={{
                    transition: 'var(--TT) all',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '0',
                    borderTop: '5px solid var(--primary-color)',
                    borderRadius: '6px 6px 0 0',
                    pointerEvents: 'none',
                  }}
                ></span>
              )}
              Receitas
            </button>
          </li>
        </ul>
        <div className="pt-3" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', border: `1px solid var(--border-color-${theme})`, borderRadius: '6px' }}>
          {renderTabContent()}
        </div>
      </div>

      {/* Modal de Despesa */}
      <DespesaModal
        show={showDespesaModal}
        onHide={() => setShowDespesaModal(false)}
        theme={theme}
        despesa={despesaEditando}
        onSave={handleSalvarDespesa}
        categorias={categorias}
        fornecedores={fornecedores}
        onCategoryCreated={handleCategoryCreated}
        onVendorCreated={handleVendorCreated}
      />

      {/* Modal de Imposto */}
      <TaxRateModal
        show={showTaxRateModal}
        onHide={() => setShowTaxRateModal(false)}
        theme={theme}
        onTaxRateCreated={handleTaxRateCreated}
      />
    </div>
  );
}

export default Financeiro; 