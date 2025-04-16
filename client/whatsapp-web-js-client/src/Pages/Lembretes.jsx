function AgendaPage() {
    useEffect(() => {
      const gerarLinhasHoras = (tbody, colunas = 1) => {
        for (let hora = 0; hora <= 23; hora++) {
          const linha = document.createElement('tr');
          const horaTexto = `${hora.toString().padStart(2, '0')}:00`;
  
          const th = document.createElement('th');
          th.textContent = horaTexto;
          linha.appendChild(th);
  
          for (let i = 0; i < colunas; i++) {
            const td = document.createElement('td');
            td.className = 'hour-cell';
            linha.appendChild(td);
          }
  
          tbody.appendChild(linha);
        }
      };
  
      gerarLinhasHoras(document.querySelector('#semana tbody'), 7);
      gerarLinhasHoras(document.querySelector('#dia tbody'));
    }, []);
  
    const mudarVisualizacao = (id) => {
      document.querySelectorAll('.schedule-view').forEach(view => view.classList.remove('active'));
      document.getElementById(id).classList.add('active');
  
      document.querySelectorAll('button.btn-outline-secondary').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('button.btn-outline-secondary'))
        .find(btn => btn.textContent.trim().toLowerCase() === id);
      if (activeBtn) activeBtn.classList.add('active');
    };
  
    return (
      <div className="h-100 w-100 mx-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => mudarVisualizacao('mes')}>Mês</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => mudarVisualizacao('semana')}>Semana</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => mudarVisualizacao('dia')}>Dia</button>
          </div>
          <input type="text" className="form-control form-control-sm d-inline w-auto" placeholder="Pesquisar..." />
        </div>
  
        <div id="mes" className="schedule-view active">
          <div className="d-flex justify-content-between mb-2">
            <div>
              <button className="btn btn-sm btn-outline-secondary">Hoje</button>
              <button className="btn btn-sm btn-outline-secondary">Anterior</button>
              <button className="btn btn-sm btn-outline-secondary">Próximo</button>
            </div>
            <h5 className="title-${theme} text-center">Abril 2025</h5>
          </div>
          <div className="table-responsive custom-table-${theme}">
            <table className="table table-bordered table-hover m-0">
              <thead>
                <tr>
                  <th>Domingo</th><th>Segunda</th><th>Terça</th><th>Quarta</th><th>Quinta</th><th>Sexta</th><th>Sábado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>30</td><td>31</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
                <tr><td>6</td><td>7</td><td>8</td><td>9</td><td className="high${theme}">10</td><td>11</td><td>12</td></tr>
                <tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>
                <tr><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td></tr>
                <tr><td>27</td><td>28</td><td>29</td><td>30</td><td>1</td><td>2</td><td>3</td></tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <div id="semana" className="schedule-view">
          <div className="d-flex justify-content-between mb-2">
            <div>
              <button className="btn btn-sm btn-outline-secondary">Hoje</button>
              <button className="btn btn-sm btn-outline-secondary">Anterior</button>
              <button className="btn btn-sm btn-outline-secondary">Próximo</button>
            </div>
            <h5 className="text-center">06 - 12 de Abril</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-${theme}">
                <tr>
                  <th style={{ width: '80px' }}>Hora</th>
                  <th>Dom</th><th>Seg</th><th>Ter</th><th>Qua</th><th className="high${theme}">Qui</th><th>Sex</th><th>Sáb</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
  
        <div id="dia" className="schedule-view">
          <div className="d-flex justify-content-between mb-2">
            <div>
              <button className="btn btn-sm btn-outline-secondary">Hoje</button>
              <button className="btn btn-sm btn-outline-secondary">Anterior</button>
              <button className="btn btn-sm btn-outline-secondary">Próximo</button>
            </div>
            <h5 className="text-center">Quinta-feira, 10 de Abril</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  