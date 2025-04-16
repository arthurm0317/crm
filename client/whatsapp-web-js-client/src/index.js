import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './Pages/Login';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChatPage from './Pages/Chats';
import DashboardCards from './Pages/Dashboard';
import UsuariosPage from './Pages/Usuarios';
import Painel from './Pages/Index';

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
   path:"/chats", 
   element: <ChatPage />
  },
  {
   path:"/dashboard", 
   element: <DashboardCards />
  },
  {
   path:"/usuarios", 
   element: <UsuariosPage />
  },
  {
   path:"/painel", 
   element: <Painel />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();