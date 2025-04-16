function UsuariosPage() {
    return (
      <div className="h-100 w-100 mx-2">
        <div className="d-flex justify-content-end align-items-center mb-3">
          <div className="input-group w-25">
            <input type="text" className="form-control" placeholder="Pesquisar..." />
            <button className="btn btn-1-${theme}">Adicionar Usuário</button>
          </div>
        </div>
  
        <div className="table-responsive custom-table-${theme}">
          <table className="table table-bordered table-hover m-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>44</td>
                <td>joão</td>
                <td>joao@gmail.com</td>
                <td>admin</td>
                <td>
                  <button className="icon-btn text-primary"><i className="bi bi-pencil-fill"></i></button>
                  <button className="icon-btn text-danger"><i className="bi bi-trash-fill"></i></button>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>Cauan</td>
                <td>cauanhakk@gmail.com</td>
                <td>admin</td>
                <td>
                  <button className="icon-btn text-primary"><i className="bi bi-pencil-fill"></i></button>
                  <button className="icon-btn text-danger"><i className="bi bi-trash-fill"></i></button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>Principal</td>
                <td>effectivegain@gmail.com</td>
                <td>admin</td>
                <td>
                  <button className="icon-btn text-primary"><i className="bi bi-pencil-fill"></i></button>
                  <button className="icon-btn text-danger"><i className="bi bi-trash-fill"></i></button>
                </td>
              </tr>
              <tr>
                <td>1</td>
                <td>Admin</td>
                <td>admin@admin.com</td>
                <td>admin</td>
                <td>
                  <button className="icon-btn text-primary"><i className="bi bi-pencil-fill"></i></button>
                  <button className="icon-btn text-danger"><i className="bi bi-trash-fill"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  