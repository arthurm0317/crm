
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/style.css';
import logo from './assets/effective-gain_logo.png';
import { useTheme } from './assets/js/useTheme';
import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

function Login() {
  const [theme, setTheme] = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Enviando login:', { email: username, password });
  
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email: username,  
        password,
      });
  
      if (response.data.success) {
        console.log("Usuário logado:", response.data.user);
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Erro no login");
    }
  };

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
      style={{ height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
        <div className="w-60 w-md-40 mb-4 d-flex justify-content-center align-items-center">
          <img src={logo} className="w-50" alt="Logo" />
        </div>

        <div className={`col-9 col-md-8 col-lg-6 col-xl-4 max-w-450 p-4 bg-form-${theme} rounded shadow`}>
          <form onSubmit={handleLogin}>
      <div className="d-flex flex-column">
      <input
        type="text"
        placeholder="Email"
        className="form-control mb-2"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          console.log("Username:", e.target.value);  
        }}
      />
      <input
        type="password"
        placeholder="Senha"
        className="form-control mb-2"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          console.log("Password:", e.target.value);  
        }}
      />

        <button type="submit" className={`btn btn-primary btn-1-${theme} mb-2`}>
          Entrar
        </button>
        {errorMsg && <small className="text-danger">{errorMsg}</small>}
      </div>
    </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
