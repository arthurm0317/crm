import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Pages/Login';
import App from './App';
import ChatPage from './Pages/Chats';
import DashboardCards from './Pages/Dashboard';
import UsuariosPage from './Pages/Usuarios';
import Painel from './Pages/Index';
import SchemasPage from './Pages/Schemas';
import reportWebVitals from './reportWebVitals';

// Importar configuração global do axios

// Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

// Configurar o router
const router = createBrowserRouter([
  {
    path: "/home",
    element: <App />
  },
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/painel", 
    element: <Painel />
  },
  {
    path: '/schemas',
    element: <SchemasPage/>
  }
]);

// Garantir que o elemento root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Criar a raiz do React e renderizar a aplicação
const root = ReactDOM.createRoot(rootElement);

// Renderizar a aplicação com StrictMode
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Inicializar web vitals
reportWebVitals();