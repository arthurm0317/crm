import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './assets/effective-gain_logo.png';
import { useTheme } from './assets/js/useTheme';

function SchemasPage({ theme: themeProp }) {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [filter, setFilter] = useState('');
  const [theme, setTheme] = useTheme(themeProp);

  const url = process.env.REACT_APP_URL;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    async function fetchSchemas() {
      try {
        const response = await axios.get(`${url}/company/tecnico`);
        setSchemas(Array.isArray(response.data) ? response.data : response.data.empresas || []);
      } catch (error) {
        console.error('Erro ao buscar schemas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemas();
  }, [url]);

  const handleEnterSchema = (schema) => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    userData.schema = schema.schema_name || schema;
    userData.empresa = schema.company_name || schema.empresa || '';
    localStorage.setItem('user', JSON.stringify(userData));
    setSelectedSchema(schema.schema_name || schema);
    navigate('/painel');
  };

  // Filtro aplicado ao array de schemas
  const filteredSchemas = Array.isArray(schemas)
    ? schemas.filter((schema) => {
        const name = (schema.company_name || schema).toString().toLowerCase();
        return name.includes(filter.toLowerCase());
      })
    : [];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
    document.cookie = `theme=${newTheme}`;
    setTheme(newTheme);
  };

  return (
    <div
      className={`d-flex justify-content-center align-items-center bg-screen-${theme}`}
      style={{ height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-color 0.3s ease' }}
    >
      <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
        <div className="w-60 w-md-40 mb-4 d-flex justify-content-center align-items-center">
          <img src={logo} className="w-50" alt="Logo" />
        </div>
        <div className={`col-9 col-md-8 col-lg-6 col-xl-4 max-w-450 p-4 bg-form-${theme} rounded shadow position-relative`}>
          <div className="d-flex flex-row align-items-center justify-content-between mb-4 mt-2 mx-3">
            <div className="d-flex align-items-center">
              <i className={`bi bi-bounding-box header-text-${theme} fs-3 me-2`}></i>
              <h2 className={`ms-3 header-text-${theme} m-0`} style={{ fontWeight: 400, fontSize: '1.5rem' }}>Escolha um Schema</h2>
            </div>
            
            <div className="d-flex flex-row align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-2-${theme}`}
              onClick={toggleTheme}
              style={{ zIndex: 2 }}
              aria-label="Alternar tema"
            >
              <i className={`${theme === 'light' ? `bi-sun` : `bi-moon-stars`}`}></i>
            </button>
            <button id="sair" type="button" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Sair" className={`btn btn-2-${theme} toggle-${theme}`} onClick={handleLogout}>
                <i className="bi bi-door-open"></i>
              </button>
            </div>

          </div>
          <input
            type="text"
            className={`form-control mb-3 input-${theme}`}
            placeholder="Filtrar por empresa..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {loading ? (
            <div className={`text-center header-text-${theme}`}>Carregando schemas...</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredSchemas.length === 0 ? (
                <div className="text-center text-muted">Nenhum resultado encontrado</div>
              ) : (
                filteredSchemas.map((schema) => (
                  <div
                    key={schema.schema_name || schema}
                    className={`card-${theme} d-flex flex-row align-items-center justify-content-between rounded shadow-sm px-4 py-3`}
                  >
                    <span className={`header-text-${theme} fw-semibold`} style={{ fontSize: '1.1rem' }}>{schema.company_name || schema}</span>
                    <button
                      className={`btn btn-2-${theme}`}
                      onClick={() => handleEnterSchema(schema)}
                    >
                      Entrar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {selectedSchema && (
            <div className="alert alert-success mt-3">
              Schema selecionado: <strong>{selectedSchema}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchemasPage;