import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Adicione isso

function SchemasPage({ theme }) {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchema, setSelectedSchema] = useState(null);

  const url = process.env.REACT_APP_URL;
  const navigate = useNavigate(); 

  useEffect(() => {
    async function fetchSchemas() {
      try {
        const response = await axios.get(`${url}/company/tecnico`);
        console.log('Schemas:', response.data);
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

  return (
    <div className="container mt-4">
      <h2 className={`header-text-${theme}`}>Escolha um Schema</h2>
      {loading ? (
        <p>Carregando schemas...</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Empresa</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(schemas) && schemas.map((schema) => (
              <tr key={schema.schema_name || schema}>
                <td>{schema.company_name || schema}</td>
                <td>
                  <button
                    className={`btn btn-1-${theme}`}
                    onClick={() => handleEnterSchema(schema)}
                  >
                    Entrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedSchema && (
        <div className="alert alert-success mt-3">
          Schema selecionado: <strong>{selectedSchema}</strong>
        </div>
      )}
    </div>
  );
}

export default SchemasPage;