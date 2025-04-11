import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/style.css';

function Login() {
  const toggleTheme = () => {
    // Implementar lógica do toggleTheme aqui
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-screen-light"
      style={{ height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
        <div className="w-60 w-md-40 mb-4 d-flex justify-content-center align-items-center">
          <img src="assets/effective-gain_logo.png" className="w-50" alt="Logo" />
        </div>

        <div className="col-9 col-md-8 col-lg-6 col-xl-4 max-w-450 p-4 bg-form-light rounded shadow">
          <form>
            <div className="mb-3">
              <div className="input-group mb-3">
                <span className="input-group-text igt-light" id="basic-addon1">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="email"
                  className="form-control input-light"
                  id="email"
                  placeholder="E-mail"
                  aria-describedby="basic-addon1"
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="input-group mb-3">
                <span className="input-group-text igt-light" id="basic-addon2">
                  <i className="bi bi-key"></i>
                </span>
                <input
                  type="password"
                  className="form-control input-light"
                  id="password"
                  placeholder="Senha"
                  aria-describedby="basic-addon2"
                />
              </div>
            </div>

            <div className="d-flex justify-content-around align-items-center mb-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label ext-label-light" htmlFor="rememberMe">
                  Lembrar senha
                </label>
              </div>
              <button type="button" className="btn btn-2-light toggle-light" onClick={toggleTheme}>
                <i className="bi bi-sun"></i>
              </button>
            </div>

            <div className="d-flex flex-column">
              <button type="submit" className="btn btn-primary btn-1-light mb-2">
                Entrar
              </button>
              <a href="./register.html" className="btn btn-secondary btn-2-light">
                Cadastrar
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
