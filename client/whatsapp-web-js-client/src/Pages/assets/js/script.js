const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const toggleIcon = toggleBtn.querySelector('i');
const logo = document.querySelector('#sidebar-top img');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    sidebar.classList.toggle('sidebar-expanded');
    toggleIcon.classList.toggle('bi-arrow-bar-right');
    toggleIcon.classList.toggle('bi-arrow-bar-left');
    if (sidebar.classList.contains('sidebar-expanded')) {
      logo.src = 'assets/effective-gain_logo.png';
  } else {
      logo.src = 'assets/favicon.png';
  }
});
document.querySelectorAll('#sidebar-body button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#sidebar-body button').forEach(b => {
      b.classList.remove('btn-selected', 'btn-1-light');
      b.classList.add('btn-2-light');
    });

    btn.classList.remove('btn-2-light');
    btn.classList.add('btn-selected', 'btn-1-light');
  });
});

document.querySelectorAll('input[name="btnradio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('label[for^="btnradio"]').forEach(label => {
      label.classList.remove('btn-primary');
      label.classList.add('btn-secondary');
    });

    const selected = document.querySelector(`label[for="${radio.id}"]`);
    selected.classList.remove('btn-secondary');
    selected.classList.add('btn-primary');
  });
});

function toggleTheme() {
  const elements = document.querySelectorAll('*');
  let theme = document.body.classList.contains('light') ? 'dark' : 'light';

  elements.forEach(element => {
    element.classList.forEach(className => {

      if (className.includes('light')) {
        element.classList.replace(className, className.replace('light', 'dark'));
        theme = 'dark';
      }
      if (className.includes('dark')) {
        element.classList.replace(className, className.replace('dark', 'light'));
        theme = 'light';
      }

      if (className.includes('sun')) {
        element.classList.replace(className, className.replace('sun', 'moon-stars'));
      } 
      if (className.includes('moon-stars')) {
        element.classList.replace(className, className.replace('moon-stars', 'sun'));
      }
    });
  });

  document.cookie = `theme=${theme}; path=/; max-age=31536000`;
}

function showPasswordConfig() {
  var container = document.getElementById('password-error-container');
  container.classList.add('show');
}
function hidePasswordConfig() {
  var container = document.getElementById('password-error-container');
  container.classList.remove('show');
}

function pwVerify(password) {

  var checks = document.querySelectorAll('.ul-pw li');
  checks.forEach(function(icon) {
    icon.classList.remove('checked');
  });
  var checks = document.querySelectorAll('.ul-pw li i');
  checks.forEach(function(icon) {
    icon.classList.remove('checked');
  });

  var maiuscula = /[A-Z]/.test(password);
  var minuscula = /[a-z]/.test(password);
  var numero = /\d/.test(password);
  var simbolo = /[@#$%&]/.test(password);
  var caractere = password.length >= 8;

  if (maiuscula === true) {
    var check = document.getElementById('maiuscula');
    check.classList.add('checked');

    var check2 = document.getElementById('maiuscula i');
    check2.classList.add('checked');
  }
  if (minuscula === true) {
    var check3 = document.getElementById('minuscula');
    check3.classList.add('checked');

    var check4 = document.getElementById('minuscula i');
    check4.classList.add('checked');
  }
  if (numero === true) {
    var check5 = document.getElementById('numero');
    check5.classList.add('checked');

    var check6 = document.getElementById('numero i');
    check6.classList.add('checked');
  }
  if (simbolo === true) {
    var check7 = document.getElementById('simbolo');
    check7.classList.add('checked');

    var check8 = document.getElementById('simbolo i');
    check8.classList.add('checked');
  }
  if (caractere === true) {
    var check9 = document.getElementById('caractere');
    check9.classList.add('checked');

    var check10 = document.getElementById('caractere i');
    check10.classList.add('checked');
  }
}

function showConfirm() {
  var container = document.getElementById('password-confirm-container');
  container.classList.add('show');
}
function hideConfirm() {
  var container = document.getElementById('password-confirm-container');
  container.classList.remove('show');
}

function pwConfirm(password) {
  var checks = document.querySelectorAll('.ul-pw2 li');
  checks.forEach(function(icon) {
    icon.classList.remove('checked');
    icon.classList.add('hidden');
  });
  var checks = document.querySelectorAll('.ul-pw2 li i');
  checks.forEach(function(icon) {
    icon.classList.remove('checked');
    icon.classList.add('hidden');
  });

  var confirm = document.getElementById('password').value === document.getElementById('confirmPassword').value;
  if (confirm === true) {
    var check11 = document.getElementById('confirm');
    if (document.getElementById('confirmPassword').value !== ''){
      check11.classList.remove('hidden');
      check11.classList.add('checked');
    }

    var check12 = document.getElementById('confirm i');
    if (document.getElementById('confirmPassword').value !== ''){
      check12.classList.remove('hidden');
      check12.classList.add('checked');
    }
  }
}

function loadTheme() {
  const cookies = document.cookie.split('; ');
  let theme = 'light';

  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (name === 'theme') {
      theme = value;
    }
  });

  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);

  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    element.classList.forEach(className => {
      
      if (className.includes('light') && theme === 'dark') {
        element.classList.replace(className, className.replace('light', 'dark'));
      } 
      if (className.includes('dark') && theme === 'light') {
        element.classList.replace(className, className.replace('dark', 'light'));
      }

      if (className.includes('sun') && theme === 'dark') {
        element.classList.replace(className, className.replace('sun', 'moon-stars'));
      } 
      if (className.includes('moon-stars') && theme === 'light') {
        element.classList.replace(className, className.replace('moon-stars', 'sun'));
      }
    });
  });
}

function toggleSidebarButton(element, htmlFile) {
  document.querySelectorAll('.sidebar-button').forEach(btn => {
    btn.classList.remove('sidebar-selected-button');
  });
  element.classList.add('sidebar-selected-button');

  fetch(htmlFile)
  .then(res => res.text())
  .then(data => {
    document.getElementById('main').innerHTML = data;
    loadTheme();
  });
}

function toggleMoneyHandler(e) {
  let button = e.target;
  
  if (!button.classList.contains('toggle-money-btn')) {
    button = button.closest('.toggle-money-btn');
  }

  if (!button) return;

  const card = button.closest('.col-md-3');
  const valueElement = card.querySelector('.money-light, .money-dark');
  const icon = button.querySelector('i');

  if (!valueElement || !icon) return;

  valueElement.classList.toggle('money-hidden');

  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
}

function initMoneyToggle() {
  const container = document.getElementById('main');
  if (!container) return;

  container.addEventListener('click', toggleMoneyHandler);
}

function loadPageContent(page) {
  return fetch(page)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main').innerHTML = html;
      loadTheme();

      const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltips.map(el => new bootstrap.Tooltip(el));
    });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function carregarAtendentes() {
  fetch('assets/js/atendentes.json')
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById('lista-atendentes');
      const onlineCount = data.filter(a => a.status === 'Online').length;
      const theme = getCookie('theme') || 'light';

      document.getElementById('atendentes-online').textContent = onlineCount;

      lista.innerHTML = `
        <li class="d-flex justify-content-between table-header-${theme} px-2 py-1">
          <span>Nome</span>
          <span>Setor</span>
          <span>Status</span>
        </li>
      `;

      data.forEach(a => {
        const li = document.createElement('li');
        li.className = 'd-flex justify-content-between px-2 py-1';
        li.innerHTML = `
          <span class="question-${theme}">${a.nome}</span>
          <span class="question-${theme}">${a.setor}</span>
          <span class="question-${theme}">
            <span class="status-dot ${a.status.toLowerCase()}"></span>
            ${a.status}
          </span>
        `;
        lista.appendChild(li);
      });
    })
    .catch(err => console.error("Erro ao carregar atendentes:", err));
}

function carregarRankingConversas() {
  fetch('assets/js/conversas-encerradas.json')
    .then(res => res.json())
    .then(data => {
      const theme = getCookie('theme') || 'light';
      const ranking = {};
      data.forEach(item => {
        ranking[item.atendente] = (ranking[item.atendente] || 0) + 1;
      });

      const ordenado = Object.entries(ranking)
        .sort((a, b) => b[1] - a[1]);

      const lista = document.getElementById('ranking-conversas');
      lista.innerHTML = `
        <li class="d-flex justify-content-between table-header-${theme} px-2 py-1">
          <span style="width: 20%"></span>
          <span style="width: 50%">Nome</span>
          <span style="width: 30%; text-align: right">Total</span>
        </li>
      `;
    
      ordenado.forEach(([nome, total], index) => {
        const li = document.createElement('li');
        li.className = 'd-flex justify-content-between px-2 py-1 question-light';
        li.innerHTML = `
          <span style="width: 20%">${index + 1}º</span>
          <span style="width: 50%">${nome}</span>
          <span style="width: 30%; text-align: right">${total}</span>
        `;
        lista.appendChild(li);
      });

    })
    .catch(err => console.error('Erro ao carregar ranking:', err));
}

function carregarRankingTempoResposta() {
  fetch('assets/js/tempos-resposta.json')
    .then(res => res.json())
    .then(data => {
      const theme = getCookie('theme') || 'light';
      const tempos = {};

      data.forEach(item => {
        const inicio = new Date(item.horario_inicio_fila);
        const resposta = new Date(item.horario_primeira_mensagem);
        const diffSegundos = (resposta - inicio) / 1000;

        if (!tempos[item.atendente]) tempos[item.atendente] = [];
        tempos[item.atendente].push(diffSegundos);
      });

      const medias = Object.entries(tempos).map(([nome, lista]) => {
        const media = lista.reduce((acc, t) => acc + t, 0) / lista.length;
        return [nome, media];
      });

      medias.sort((a, b) => a[1] - b[1]);

      const lista = document.getElementById('ranking-tempo');
      lista.innerHTML = '';

      // Cabeçalho
      const header = document.createElement('li');
      header.className = `d-flex justify-content-between table-header-${theme} px-2 py-1`;
      header.innerHTML = `
        <span style="width: 20%"></span>
        <span style="width: 50%">Nome</span>
        <span style="width: 30%; text-align: right">Tempo</span>
      `;
      lista.appendChild(header);

      // Linhas
      medias.forEach(([nome, media], index) => {
        const li = document.createElement('li');
        li.className = `d-flex justify-content-between question-${theme} px-2 py-1`;

        const minutos = Math.floor(media / 60);
        const segundos = Math.round(media % 60);
        const tempoFormatado = `${minutos}m ${segundos}s`;

        li.innerHTML = `
          <span style="width: 20%">${index + 1}º</span>
          <span style="width: 50%">${nome}</span>
          <span style="width: 30%; text-align: right">${tempoFormatado}</span>
        `;
        lista.appendChild(li);
      });
    })
    .catch(err => console.error('Erro ao carregar ranking:', err));
}

document.addEventListener('DOMContentLoaded', function () {
  loadTheme();

  loadPageContent('dashboard.html').then(() => {
    carregarAtendentes();
    setTimeout(carregarRankingConversas, 100);
    setTimeout(carregarRankingTempoResposta, 100);
  });

  document.getElementById('dashboard').addEventListener('click', () => {
    loadPageContent('dashboard.html').then(() => {
      carregarAtendentes();
      carregarRankingConversas();
      carregarRankingTempoResposta();
    });
  });

  document.getElementById('chats').addEventListener('click', () => {
    loadPageContent('chats.html');
  });

  document.getElementById('usuarios').addEventListener('click', () => {
    loadPageContent('usuarios.html');
  });

  document.getElementById('lembretes').addEventListener('click', () => {
    loadPageContent('lembretes.html');
  });

  document.getElementById('relatorios').addEventListener('click', () => {
    loadPageContent('relatorios.html');
  });

  // Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  document.querySelectorAll('#sidebar-body button').forEach(el => {
    el.addEventListener('click', () => {
      const tooltip = bootstrap.Tooltip.getInstance(el);
      if (tooltip) tooltip.hide();
    });
  });
  
});
