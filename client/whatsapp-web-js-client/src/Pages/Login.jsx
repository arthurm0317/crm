import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/style.css';
import logo from './assets/effective-gain_logo.png';
import { useTheme } from './assets/js/useTheme';
import { useEffect } from 'react';
import React, { use, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const url = process.env.REACT_APP_URL;

function Login() {
  const [theme, setTheme] = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedCredentials = JSON.parse(localStorage.getItem('rememberedCredentials')) || {};
    if (rememberedCredentials[username]) {
      setPassword(rememberedCredentials[username]);
      setRememberMe(true);
    } else {
      setPassword('');
      setRememberMe(false);
    }
  }, [username]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://landing-page-teste.8rxpnw.easypanel.host/api/login', {
        email: username,
        password,
      });
      if (response.data.success) {
        const userData = {
          id: response.data.user.id,
          username: response.data.user.name,
          role: response.data.user.permission,
          empresa: response.data.company.company_name,
          schema: response.data.company.schema_name,
        };
        localStorage.setItem('user', JSON.stringify(userData));

        const rememberedCredentials = JSON.parse(localStorage.getItem('rememberedCredentials')) || {};
        if (rememberMe) {
          rememberedCredentials[username] = password;
        } else {
          delete rememberedCredentials[username];
        }
        localStorage.setItem('rememberedCredentials', JSON.stringify(rememberedCredentials));

        navigate('/painel');
      }
    } catch (err) {
      const senhaIncorretaElement = document.     getElementById("senhaIncorreta");
      if (senhaIncorretaElement) {
        senhaIncorretaElement.classList.remove("d-none");
      }
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
            <div className="mb-3">
              <div className="input-group mb-3">
                <span className={`input-group-text igt-${theme}`} id="basic-addon1">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="email"
                  className={`form-control input-${theme}`}
                  placeholder="E-mail"
                  aria-describedby="basic-addon1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="input-group mb-3">
                <span className={`input-group-text igt-${theme}`} id="basic-addon2">
                  <i className="bi bi-key"></i>
                </span>
                <input
                  type="password"
                  className={`form-control input-${theme}`}
                  placeholder="Senha"
                  aria-describedby="basic-addon2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div id="senhaIncorreta" className="pb-3 d-flex justify-content-center text-danger d-none">Login e/ou senha incorretos, tente novamente.</div>

            <div className="d-flex justify-content-around align-items-center mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label className={`form-check-label ext-label-${theme}`} htmlFor="rememberMe">
                  Lembrar senha
                </label>
              </div>
              <button
                type="button"
                className={`btn btn-2-${theme} toggle-${theme}`}
                onClick={toggleTheme}
              >
                <i className={`${theme === 'light' ? `bi-sun` : `bi-moon-stars`}`}></i>
              </button>
            </div>

            <div className="d-flex flex-column">
              <button type="submit" className={`btn btn-primary btn-1-${theme}`}>
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;