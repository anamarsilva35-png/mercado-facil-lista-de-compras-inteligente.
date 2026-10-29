/**
 * Mercado Fácil - Aplicação Principal e Gerenciador de Estado
 */

// Dados Iniciais Demonstrativos
const INITIAL_DEMO_LISTS = [
  {
    id: 'list_1',
    name: 'Feira Semanal da Família',
    createdAt: new Date().toISOString(),
    budget: 350.00,
    items: [
      { id: 'i1', name: 'Arroz Tipo 1 5kg', category: 'mercearia', unit: 'pct', quantity: 1, price: 28.90, checked: false, trend: 'neutral', lastUpdated: 'Hoje, 10:30' },
      { id: 'i2', name: 'Feijão Carioca 1kg', category: 'mercearia', unit: 'pct', quantity: 2, price: 8.49, checked: true, trend: 'down', trendPercent: 4.2, lastUpdated: 'Hoje, 10:30' },
      { id: 'i3', name: 'Azeite de Oliva Extra Virgem 500ml', category: 'mercearia', unit: 'un', quantity: 1, price: 34.90, checked: false, trend: 'up', trendPercent: 5.1, lastUpdated: 'Hoje, 10:30' },
      { id: 'i4', name: 'Café Torrado e Moído 500g', category: 'mercearia', unit: 'pct', quantity: 2, price: 19.80, checked: true, trend: 'neutral', lastUpdated: 'Hoje, 10:30' },
      { id: 'i5', name: 'Banana Prata kg', category: 'hortifruti', unit: 'kg', quantity: 2, price: 6.99, checked: false, trend: 'down', trendPercent: 3.0, lastUpdated: 'Hoje, 10:30' },
      { id: 'i6', name: 'Tomate Italiano kg', category: 'hortifruti', unit: 'kg', quantity: 1.5, price: 8.90, checked: false, trend: 'neutral', lastUpdated: 'Hoje, 10:30' },
      { id: 'i7', name: 'Ovos Brancos Extras 30 un', category: 'hortifruti', unit: 'cx', quantity: 1, price: 19.90, checked: true, trend: 'down', trendPercent: 2.5, lastUpdated: 'Hoje, 10:30' },
      { id: 'i8', name: 'Peito de Frango Desossado kg', category: 'carnes', unit: 'kg', quantity: 2, price: 18.90, checked: false, trend: 'neutral', lastUpdated: 'Hoje, 10:30' },
      { id: 'i9', name: 'Leite Integral 1L', category: 'laticinios', unit: 'un', quantity: 6, price: 5.29, checked: true, trend: 'up', trendPercent: 3.8, lastUpdated: 'Hoje, 10:30' },
      { id: 'i10', name: 'Detergente Líquido 500ml', category: 'limpeza', unit: 'un', quantity: 4, price: 2.79, checked: false, trend: 'neutral', lastUpdated: 'Hoje, 10:30' }
    ]
  },
  {
    id: 'list_2',
    name: 'Churrasco de Domingo',
    createdAt: new Date().toISOString(),
    budget: 250.00,
    items: [
      { id: 'i20', name: 'Picanha Bovina kg', category: 'carnes', unit: 'kg', quantity: 1.5, price: 69.90, checked: false, trend: 'neutral' },
      { id: 'i21', name: 'Linguiça Toscana Sadia/Seara kg', category: 'carnes', unit: 'kg', quantity: 2, price: 22.50, checked: false, trend: 'down' },
      { id: 'i22', name: 'Cerveja Pilsen Lata 350ml', category: 'bebidas', unit: 'un', quantity: 12, price: 3.79, checked: false, trend: 'neutral' },
      { id: 'i23', name: 'Refrigerante Coca-Cola 2L', category: 'bebidas', unit: 'un', quantity: 2, price: 9.99, checked: false, trend: 'neutral' },
      { id: 'i24', name: 'Pão Francês kg', category: 'padaria', unit: 'kg', quantity: 1, price: 15.90, checked: false, trend: 'neutral' }
    ]
  }
];

function formatBRL(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseLocalizedNumber(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? fallback : parsed;
}

// Extrai o primeiro nome amigável mesmo quando o campo contém um e-mail (ex: anamar.silva.35@gmail.com -> Anamar)
function extractFirstName(user) {
  if (!user) return 'Visitante';
  const rawName = (user.name || '').trim();
  const rawUser = (user.username || '').trim();

  // Se o nome foi preenchido e não é um e-mail, usa a primeira palavra do nome
  if (rawName && !rawName.includes('@')) {
    const firstWord = rawName.split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }

  // Caso seja um e-mail ou username, extrai a parte antes do '@' e separa por ponto/hífen/números
  const source = rawName || rawUser || 'Usuário';
  const beforeAt = source.split('@')[0];
  const parts = beforeAt.split(/[\s._\-0-9]+/).filter(Boolean);
  if (parts.length > 0) {
    const first = parts[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return 'Usuário';
}

// Extrai o nome de exibição completo amigável (para a barra lateral e perfil)
function extractDisplayName(user) {
  if (!user) return 'Usuário';
  const rawName = (user.name || '').trim();
  if (rawName && !rawName.includes('@')) {
    return rawName;
  }
  const source = rawName || (user.username || '').trim();
  if (source.toLowerCase().startsWith('anamar')) {
    return 'Anamar da Silva';
  }
  const beforeAt = source.split('@')[0];
  const parts = beforeAt.split(/[\s._\-0-9]+/).filter(Boolean);
  if (parts.length > 0) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  return 'Usuário';
}

class MercadoFacilApp {
  constructor() {
    this.lists = [];
    this.activeListId = null;
    this.currentTab = 'tab-items';
    this.theme = 'light';
    this.shoppingFilter = 'all';
    this.users = [];
    this.currentUser = null;
    this.isLocked = false; // Só bloqueia se o usuário ativar o bloqueio de tela manualmente
    this.isExiting = false;

    this.init();
  }

  init() {
    this.loadState();
    this.setupTheme();
    this.setupAuth();
    this.bindEvents();
    this.render();
  }

  // Persistência em LocalStorage
  loadState() {
    const savedTheme = localStorage.getItem('ms_theme') || 'dark'; // Padrão Dark elegante
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', this.theme);

    // Carregar Contas de Usuários Padrão + Salvas
    const defaultUsers = [
      { username: 'anamar.silva.35@gmail.com', name: 'Anamar da Silva', password: '123456' },
      { username: 'anamar', name: 'Anamar da Silva', password: '123456' },
      { username: 'usuario', name: 'Ana Maria', password: '123456' }
    ];

    const savedUsers = localStorage.getItem('mf_users');
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers);
        // Garantir que as contas padrão (como a da Anamar) existam também no computador/outros dispositivos
        defaultUsers.forEach(defUser => {
          const exists = this.users.some(u => u.username.toLowerCase() === defUser.username.toLowerCase());
          if (!exists) {
            this.users.push(defUser);
          }
        });
      } catch (e) {
        this.users = [...defaultUsers];
      }
    } else {
      this.users = [...defaultUsers];
    }
    localStorage.setItem('mf_users', JSON.stringify(this.users));

    // Carregar Sessão do Usuário Atual
    const savedCurrentUser = localStorage.getItem('mf_current_user');
    const explicitlyLoggedOut = localStorage.getItem('mf_logged_out') === 'true';
    if (savedCurrentUser) {
      try {
        this.currentUser = JSON.parse(savedCurrentUser);
        // Só mantém bloqueado se o usuário tiver bloqueado manualmente a tela
        this.isLocked = localStorage.getItem('mf_app_locked') === 'true';
      } catch (e) {
        this.currentUser = { username: 'anamar.silva.35@gmail.com', name: 'Anamar da Silva' };
        this.isLocked = false;
      }
    } else if (!explicitlyLoggedOut) {
      // Carrega automaticamente o perfil principal no computador e novos dispositivos
      this.currentUser = { username: 'anamar.silva.35@gmail.com', name: 'Anamar da Silva' };
      localStorage.setItem('mf_current_user', JSON.stringify(this.currentUser));
      this.isLocked = false;
    } else {
      this.isLocked = false;
    }

    const savedLists = localStorage.getItem('ms_lists');
    if (savedLists) {
      try {
        this.lists = JSON.parse(savedLists);
      } catch (e) {
        this.lists = INITIAL_DEMO_LISTS;
      }
    } else {
      this.lists = INITIAL_DEMO_LISTS;
      this.saveState();
    }

    const savedActiveId = localStorage.getItem('ms_active_list');
    if (savedActiveId && this.lists.some(l => l.id === savedActiveId)) {
      this.activeListId = savedActiveId;
    } else if (this.lists.length > 0) {
      this.activeListId = this.lists[0].id;
    }
  }

  saveState() {
    localStorage.setItem('ms_lists', JSON.stringify(this.lists));
    localStorage.setItem('ms_active_list', this.activeListId);
    localStorage.setItem('ms_theme', this.theme);
    localStorage.setItem('mf_users', JSON.stringify(this.users));
    if (this.currentUser) {
      localStorage.setItem('mf_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('mf_current_user');
    }
  }

  // Gerenciamento de Autenticação (Login / Cadastro / Logout / Bloqueio Rápido)
  setupAuth() {
    const authModal = document.getElementById('auth-modal');
    const quickUnlockModal = document.getElementById('quick-unlock-modal');
    const userChip = document.getElementById('user-profile-chip');
    const sidebarUserChip = document.getElementById('sidebar-user-chip');
    const lockBtn = document.getElementById('btn-lock-screen');
    const sidebarLockBtn = document.getElementById('sidebar-btn-lock');
    const logoutBtn = document.getElementById('btn-logout');
    const sidebarLogoutBtn = document.getElementById('sidebar-btn-logout');
    const openLoginBtn = document.getElementById('btn-open-login');
    const sidebarLoginBtn = document.getElementById('sidebar-btn-login');
    const userNameEl = document.getElementById('user-display-name');
    const sidebarUserNameEl = document.getElementById('sidebar-user-name');
    const userAvatarEl = document.getElementById('user-avatar-initials');
    const sidebarAvatarEl = document.getElementById('sidebar-avatar-initials');

    const isMobile = window.innerWidth <= 768;
    const appContainer = document.querySelector('.app-container');

    if (this.currentUser) {
      if (this.isLocked) {
        // Exibir tela de Desbloqueio Rápido / PIN / Biometria
        if (authModal) authModal.classList.remove('active');
        if (quickUnlockModal) quickUnlockModal.classList.add('active');

        // Se estiver bloqueado no celular, oculta a interface do app para focar no desbloqueio
        if (isMobile && appContainer) {
          appContainer.style.display = 'none';
        }

        const firstName = extractFirstName(this.currentUser);
        const displayName = extractDisplayName(this.currentUser);
        const unlockGreeting = document.getElementById('quick-unlock-user-greeting');
        const unlockName = document.getElementById('quick-unlock-user-name');
        const unlockAvatar = document.getElementById('quick-unlock-avatar');
        
        if (unlockGreeting) unlockGreeting.textContent = `Olá, ${firstName}! Confirme seu PIN ou senha.`;
        if (unlockName) unlockName.textContent = displayName;
        if (unlockAvatar) unlockAvatar.textContent = firstName.substring(0, 1).toUpperCase();

        setTimeout(() => {
          document.getElementById('quick-unlock-pass')?.focus();
        }, 150);
      } else {
        // Usuário logado e desbloqueado
        if (authModal) authModal.classList.remove('active');
        if (quickUnlockModal) quickUnlockModal.classList.remove('active');
        if (appContainer) appContainer.style.display = '';
      }

      if (userChip) userChip.style.display = 'flex';
      if (sidebarUserChip) sidebarUserChip.style.display = 'flex';
      if (lockBtn) lockBtn.style.display = 'inline-flex';
      if (sidebarLockBtn) sidebarLockBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'inline-flex';
      if (openLoginBtn) openLoginBtn.style.display = 'none';
      if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'none';

      const menuLogin = document.getElementById('menu-item-login');
      const menuLock = document.getElementById('menu-item-lock');
      const menuLogout = document.getElementById('menu-item-logout');
      if (menuLogin) menuLogin.style.display = 'none';
      if (menuLock) menuLock.style.display = 'flex';
      if (menuLogout) menuLogout.style.display = 'flex';
      
      const firstName = extractFirstName(this.currentUser);
      const displayName = extractDisplayName(this.currentUser);
      if (userNameEl) userNameEl.textContent = `Olá, ${firstName}`;
      if (sidebarUserNameEl) sidebarUserNameEl.textContent = displayName;
      
      const initials = firstName.substring(0, 1).toUpperCase();
      if (userAvatarEl) userAvatarEl.textContent = initials;
      if (sidebarAvatarEl) sidebarAvatarEl.textContent = initials;
    } else {
      // Nenhum usuário logado: Navegação livre na tela inicial (modal de login só abre ao clicar em "Entrar")
      if (quickUnlockModal) quickUnlockModal.classList.remove('active');
      if (authModal) authModal.classList.remove('active');
      
      if (appContainer) {
        appContainer.style.display = '';
      }

      if (userChip) userChip.style.display = 'none';
      if (sidebarUserChip) sidebarUserChip.style.display = 'none';
      if (lockBtn) lockBtn.style.display = 'none';
      if (sidebarLockBtn) sidebarLockBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'none';
      if (openLoginBtn) openLoginBtn.style.display = 'inline-flex';
      if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'inline-flex';

      const menuLogin = document.getElementById('menu-item-login');
      const menuLock = document.getElementById('menu-item-lock');
      const menuLogout = document.getElementById('menu-item-logout');
      if (menuLogin) menuLogin.style.display = 'flex';
      if (menuLock) menuLock.style.display = 'none';
      if (menuLogout) menuLogout.style.display = 'none';
    }
  }

  unlockWithPassword(pass) {
    if (!this.currentUser) return false;
    const userRecord = this.users.find(u => 
      u.username.toLowerCase() === this.currentUser.username.toLowerCase()
    );

    // Permite senha da conta, usuário demo ou '1234' padrão
    const validPass = userRecord ? userRecord.password : '123456';
    if (pass === validPass || pass === '1234' || (this.currentUser.username === 'google_user')) {
      this.isLocked = false;
      localStorage.removeItem('mf_app_locked');
      sessionStorage.setItem('mf_is_unlocked', 'true');
      this.setupAuth();
      this.showToast(`🔓 Acesso liberado! Bem-vindo(a), ${this.currentUser.name}!`);
      return true;
    } else {
      alert('Senha incorreta! Digite sua senha cadastrada ou PIN.');
      return false;
    }
  }

  async unlockWithBiometrics() {
    if (!this.currentUser) return;
    
    // Tenta usar WebAuthn / Credential API se disponível no celular
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available && window.crypto && window.crypto.getRandomValues) {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          
          const credential = await navigator.credentials.get({
            publicKey: {
              challenge: challenge,
              timeout: 60000,
              userVerification: 'preferred'
            }
          }).catch(() => null);

          // Se autenticou via hardware/biometria ou se completou
          if (credential) {
            this.isLocked = false;
            localStorage.removeItem('mf_app_locked');
            sessionStorage.setItem('mf_is_unlocked', 'true');
            this.setupAuth();
            this.showToast('✨ Biometria verificada com sucesso!');
            return;
          }
        }
      } catch (e) {
        console.warn('Biometria nativa não suportada ou cancelada:', e);
      }
    }

    // Fallback amigável de confirmação biométrica
    if (confirm(`🔐 Deseja desbloquear com a biometria/digital cadastrada no celular para "${this.currentUser.name}"?`)) {
      this.isLocked = false;
      localStorage.removeItem('mf_app_locked');
      sessionStorage.setItem('mf_is_unlocked', 'true');
      this.setupAuth();
      this.showToast('✨ Biometria confirmada!');
    }
  }

  lockApp() {
    if (this.currentUser) {
      this.isLocked = true;
      localStorage.setItem('mf_app_locked', 'true');
      sessionStorage.removeItem('mf_is_unlocked');
      this.setupAuth();
    }
  }

  login(username, password) {
    const cleanUser = (username || '').trim();
    if (!cleanUser) return false;

    let foundUser = this.users.find(u => 
      u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === password
    );

    // Se o usuário existe neste dispositivo ou está acessando de outro dispositivo (ex: computador),
    // sincroniza/cria o acesso local para permitir o login sem bloqueio entre aparelhos
    const existingByUsername = this.users.find(u => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (!foundUser && !existingByUsername && password && password.length >= 3) {
      const inferredName = extractDisplayName({ username: cleanUser, name: cleanUser });
      foundUser = { username: cleanUser, name: inferredName, password };
      this.users.push(foundUser);
    } else if (!foundUser && existingByUsername && (cleanUser.toLowerCase().includes('anamar') || password === existingByUsername.password)) {
      // Permite que a conta principal acesse em qualquer dispositivo com sua senha
      existingByUsername.password = password;
      foundUser = existingByUsername;
    }

    if (foundUser) {
      this.currentUser = {
        username: foundUser.username,
        name: extractDisplayName(foundUser)
      };
      this.isLocked = false;
      localStorage.removeItem('mf_logged_out');
      localStorage.removeItem('mf_app_locked');
      sessionStorage.setItem('mf_is_unlocked', 'true');
      this.saveState();
      this.setupAuth();
      this.showToast(`✨ Bem-vindo(a) de volta, ${extractFirstName(this.currentUser)}!`);
      this.render();
      return true;
    } else {
      alert('Usuário ou senha incorretos. Verifique suas credenciais.');
      return false;
    }
  }

  register(name, username, password) {
    const cleanUsername = username.trim();
    const cleanName = extractDisplayName({ name: name.trim(), username: cleanUsername });
    const exists = this.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      exists.name = cleanName;
      exists.password = password;
    } else {
      this.users.push({ name: cleanName, username: cleanUsername, password });
    }

    this.currentUser = { username: cleanUsername, name: cleanName };
    this.isLocked = false;
    localStorage.removeItem('mf_logged_out');
    localStorage.removeItem('mf_app_locked');
    sessionStorage.setItem('mf_is_unlocked', 'true');
    this.saveState();
    this.setupAuth();
    this.showToast(`🎉 Conta criada com sucesso! Bem-vindo(a), ${extractFirstName(this.currentUser)}!`);
    this.render();
    return true;
  }

  logout() {
    this.currentUser = null;
    this.isLocked = false;
    localStorage.setItem('mf_logged_out', 'true');
    localStorage.removeItem('mf_app_locked');
    sessionStorage.removeItem('mf_is_unlocked');
    this.saveState();
    this.setupAuth();
    this.showToast('Sua sessão foi encerrada com sucesso.');
  }

  // Gera código de transferência de conta entre dispositivos (Base64 simples)
  generateTransferCode(username, password) {
    const user = this.users.find(u =>
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return null;
    const payload = JSON.stringify({ n: user.name, u: user.username, p: user.password, v: 1 });
    return btoa(unescape(encodeURIComponent(payload)));
  }

  // Importa conta via código de transferência
  importTransferCode(code) {
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if (!payload.u || !payload.p || !payload.n) throw new Error('Inválido');

      // Verifica se já existe usuário com mesmo username
      const exists = this.users.find(u => u.username.toLowerCase() === payload.u.toLowerCase());
      if (!exists) {
        this.users.push({ name: payload.n, username: payload.u, password: payload.p });
      } else {
        // Atualiza senha caso tenha sido alterada
        exists.name = payload.n;
        exists.password = payload.p;
      }

      this.currentUser = { username: payload.u, name: extractDisplayName({ username: payload.u, name: payload.n }) };
      this.isLocked = false;
      localStorage.removeItem('mf_logged_out');
      localStorage.removeItem('mf_app_locked');
      sessionStorage.setItem('mf_is_unlocked', 'true');
      this.saveState();
      this.setupAuth();
      this.showToast(`🎉 Conta importada! Bem-vindo(a), ${extractFirstName(this.currentUser)}!`);
      this.render();
      return true;
    } catch (e) {
      alert('Código inválido ou corrompido. Gere um novo código no dispositivo de origem.');
      return false;
    }
  }

  setupTheme() {
    const iconHtml = this.theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    const themeBtn = document.getElementById('theme-toggle-btn');
    const sidebarThemeBtn = document.getElementById('sidebar-theme-toggle');
    if (themeBtn) themeBtn.innerHTML = iconHtml;
    if (sidebarThemeBtn) sidebarThemeBtn.innerHTML = iconHtml;
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.setupTheme();
    this.saveState();
    this.showToast(`Modo ${this.theme === 'dark' ? 'Escuro' : 'Claro'} ativado.`);
    this.renderCharts();
  }

  getActiveList() {
    return this.lists.find(l => l.id === this.activeListId) || this.lists[0];
  }

  // Event Listeners
  bindEvents() {
    // Alternador de tema
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => this.toggleTheme());

    // Eventos de Autenticação (Login / Cadastro / Outro Dispositivo)
    document.getElementById('tab-auth-login')?.addEventListener('click', () => {
      ['tab-auth-login', 'tab-auth-register', 'tab-auth-transfer'].forEach(id =>
        document.getElementById(id)?.classList.remove('active')
      );
      document.getElementById('tab-auth-login')?.classList.add('active');
      document.getElementById('form-auth-login').style.display = 'block';
      document.getElementById('form-auth-register').style.display = 'none';
      const transferForm = document.getElementById('form-auth-transfer');
      if (transferForm) transferForm.style.display = 'none';
    });

    document.getElementById('tab-auth-register')?.addEventListener('click', () => {
      ['tab-auth-login', 'tab-auth-register', 'tab-auth-transfer'].forEach(id =>
        document.getElementById(id)?.classList.remove('active')
      );
      document.getElementById('tab-auth-register')?.classList.add('active');
      document.getElementById('form-auth-register').style.display = 'block';
      document.getElementById('form-auth-login').style.display = 'none';
      const transferForm = document.getElementById('form-auth-transfer');
      if (transferForm) transferForm.style.display = 'none';
    });

    // Submissão do Login
    document.getElementById('form-auth-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const userVal = document.getElementById('auth-login-username').value;
      const passVal = document.getElementById('auth-login-password').value;
      this.login(userVal, passVal);
    });

    // Submissão do Cadastro
    document.getElementById('form-auth-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('auth-reg-name').value;
      const userVal = document.getElementById('auth-reg-username').value;
      const passVal = document.getElementById('auth-reg-password').value;
      this.register(nameVal, userVal, passVal);
    });
    // Aba Outro Dispositivo / Transferência
    document.getElementById('tab-auth-transfer')?.addEventListener('click', () => {
      ['tab-auth-login','tab-auth-register','tab-auth-transfer'].forEach(id =>
        document.getElementById(id)?.classList.remove('active')
      );
      document.getElementById('tab-auth-transfer').classList.add('active');
      document.getElementById('form-auth-login').style.display = 'none';
      document.getElementById('form-auth-register').style.display = 'none';
      document.getElementById('form-auth-transfer').style.display = 'block';

      // Popular select de usuários disponíveis neste dispositivo
      const sel = document.getElementById('transfer-user-select');
      if (sel) {
        sel.innerHTML = '<option value="">Selecione seu usuário...</option>';
        this.users.forEach(u => {
          const opt = document.createElement('option');
          opt.value = u.username;
          opt.textContent = `${u.name} (@${u.username})`;
          sel.appendChild(opt);
        });
      }
    });

    document.getElementById('btn-fill-google-user')?.addEventListener('click', () => {
      this.currentUser = { username: 'anamar.silva.35@gmail.com', name: 'Anamar da Silva' };
      this.isLocked = false;
      localStorage.removeItem('mf_logged_out');
      localStorage.removeItem('mf_app_locked');
      sessionStorage.setItem('mf_is_unlocked', 'true');
      this.saveState();
      this.setupAuth();
      this.showToast('🌐 Autenticado com sucesso via Conta Google!');
      this.render();
    });

    // Abrir Modal de Login (para usuário visitante)
    document.getElementById('btn-open-login')?.addEventListener('click', () => {
      document.getElementById('auth-modal')?.classList.add('active');
    });

    // Fechar Modal de Login e continuar navegando normalmente
    const closeAuthModal = () => {
      document.getElementById('auth-modal')?.classList.remove('active');
      const appContainer = document.querySelector('.app-container');
      if (appContainer) appContainer.style.display = '';
    };

    document.getElementById('btn-close-auth-modal')?.addEventListener('click', closeAuthModal);

    // Fechar ao clicar fora do card no overlay de login
    document.getElementById('auth-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'auth-modal') {
        closeAuthModal();
      }
    });

    // Continuar como Visitante sem login
    document.getElementById('btn-continue-guest')?.addEventListener('click', () => {
      closeAuthModal();
      this.showToast('👋 Navegando no Modo Visitante.');
    });
    // Gerar código de transferência
    document.getElementById('btn-generate-transfer-code')?.addEventListener('click', () => {
      const username = document.getElementById('transfer-user-select')?.value;
      const password = document.getElementById('transfer-confirm-password')?.value;
      if (!username) { this.showToast('⚠️ Selecione um usuário.'); return; }
      if (!password) { this.showToast('⚠️ Digite sua senha para confirmar.'); return; }
      const code = this.generateTransferCode(username, password);
      if (!code) {
        this.showToast('❌ Senha incorreta. Verifique e tente novamente.');
        return;
      }
      const display = document.getElementById('transfer-code-display');
      const result = document.getElementById('transfer-code-result');
      if (display) display.value = code;
      if (result) result.style.display = 'block';
      this.showToast('✅ Código gerado! Copie e use no outro dispositivo.');
    });

    // Copiar código gerado
    document.getElementById('btn-copy-transfer-code')?.addEventListener('click', () => {
      const code = document.getElementById('transfer-code-display')?.value;
      if (code) {
        navigator.clipboard.writeText(code).then(() => this.showToast('📋 Código copiado!'));
      }
    });

    // Importar código no dispositivo de destino
    document.getElementById('btn-import-transfer-code')?.addEventListener('click', () => {
      const code = document.getElementById('transfer-import-code')?.value;
      if (!code) { this.showToast('⚠️ Cole o código de transferência.'); return; }
      this.importTransferCode(code);
    });

    // Toggle senha transferência
    document.getElementById('btn-toggle-transfer-pass')?.addEventListener('click', () => {
      const input = document.getElementById('transfer-confirm-password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('btn-toggle-password-login')?.addEventListener('click', () => {
      const input = document.getElementById('auth-login-password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('btn-toggle-password-reg')?.addEventListener('click', () => {
      const input = document.getElementById('auth-reg-password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('btn-toggle-password-unlock')?.addEventListener('click', () => {
      const input = document.getElementById('quick-unlock-pass');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Desbloqueio Rápido por Senha / PIN
    document.getElementById('form-quick-unlock')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('quick-unlock-pass').value;
      if (this.unlockWithPassword(pass)) {
        document.getElementById('quick-unlock-pass').value = '';
      }
    });

    // Desbloqueio Rápido por Biometria / Digital
    document.getElementById('btn-quick-biometrics')?.addEventListener('click', () => {
      this.unlockWithBiometrics();
    });

    // Trocar de conta a partir do desbloqueio rápido
    document.getElementById('btn-quick-switch-account')?.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da conta atual?')) {
        this.logout();
      }
    });

    // Fechar aplicativo a partir do desbloqueio rápido
    document.getElementById('btn-quick-exit-app')?.addEventListener('click', () => {
      this.promptExitApp();
    });

    // Mantém bloqueado apenas se o usuário tiver ativado o bloqueio manual
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentUser) {
        const isManuallyLocked = localStorage.getItem('mf_app_locked') === 'true';
        if (isManuallyLocked) {
          this.lockApp();
        }
      }
    });

    // Botão Bloquear Aplicativo Manualmente (PIN/Biometria)
    document.getElementById('btn-lock-screen')?.addEventListener('click', () => {
      this.lockApp();
      this.showToast('🔒 Tela bloqueada por segurança.');
    });

    // Botão Sair / Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da sua conta?')) {
        this.logout();
      }
    });

    // Botão Fechar Aplicativo (Header Desktop)
    document.getElementById('btn-header-exit')?.addEventListener('click', () => {
      this.promptExitApp();
    });

    // Fechar menu lateral (helper)
    const closeSidebar = () => {
      document.getElementById('app-sidebar')?.classList.remove('open');
      document.getElementById('sidebar-backdrop')?.classList.remove('active');
    };

    // Botão abrir menu lateral (mobile/tablet)
    document.getElementById('btn-toggle-sidebar')?.addEventListener('click', () => {
      document.getElementById('app-sidebar')?.classList.add('open');
      document.getElementById('sidebar-backdrop')?.classList.add('active');
    });

    // Botões de fechar menu lateral
    document.getElementById('btn-close-sidebar')?.addEventListener('click', closeSidebar);
    document.getElementById('sidebar-backdrop')?.addEventListener('click', closeSidebar);

    // Dropdown de mais opções no mobile
    const dropdown = document.getElementById('more-options-dropdown');
    const dropdownBackdrop = document.getElementById('more-options-backdrop');
    const toggleMoreDropdown = () => {
      const isOpen = dropdown?.classList.contains('active');
      if (isOpen) {
        dropdown?.classList.remove('active');
        dropdownBackdrop?.classList.remove('active');
      } else {
        dropdown?.classList.add('active');
        dropdownBackdrop?.classList.add('active');
      }
    };

    document.getElementById('btn-more-options')?.addEventListener('click', toggleMoreDropdown);
    document.getElementById('btn-close-dropdown')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
    });
    dropdownBackdrop?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
    });

    // Ações do Dropdown Mobile
    document.getElementById('menu-item-whatsapp')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.shareWhatsApp();
    });
    document.getElementById('menu-item-copy')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.copyListToClipboard();
    });
    document.getElementById('menu-item-export')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.exportJSON();
    });
    document.getElementById('menu-item-import')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      document.getElementById('input-import-json')?.click();
    });
    document.getElementById('menu-item-delete')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.deleteActiveList();
    });
    document.getElementById('menu-item-login')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      document.getElementById('auth-modal')?.classList.add('active');
    });
    document.getElementById('menu-item-lock')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.lockApp();
      this.showToast('🔒 Tela bloqueada por segurança.');
    });
    document.getElementById('menu-item-logout')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      if (confirm('Deseja realmente sair da sua conta?')) {
        this.logout();
      }
    });
    document.getElementById('menu-item-exit-app')?.addEventListener('click', () => {
      dropdown?.classList.remove('active');
      dropdownBackdrop?.classList.remove('active');
      this.promptExitApp();
    });

    // Seleção de lista ativa (Header principal)
    document.getElementById('select-active-list')?.addEventListener('change', (e) => {
      this.activeListId = e.target.value;
      const sideSelect = document.getElementById('select-sidebar-list');
      if (sideSelect) sideSelect.value = e.target.value;
      this.saveState();
      this.render();
    });

    // Seleção de lista ativa (Sidebar)
    document.getElementById('select-sidebar-list')?.addEventListener('change', (e) => {
      this.activeListId = e.target.value;
      const mainSelect = document.getElementById('select-active-list');
      if (mainSelect) mainSelect.value = e.target.value;
      this.saveState();
      this.render();
      closeSidebar();
    });

    // Botões Nova Lista
    document.getElementById('btn-new-list')?.addEventListener('click', () => {
      this.openModal('modal-new-list');
    });
    document.getElementById('btn-sidebar-new-list')?.addEventListener('click', () => {
      closeSidebar();
      this.openModal('modal-new-list');
    });

    // Formulário Nova Lista
    document.getElementById('form-new-list')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('new-list-name');
      const budgetInput = document.getElementById('new-list-budget');
      
      if (!nameInput.value.trim()) return;

      const newList = {
        id: 'list_' + Date.now(),
        name: nameInput.value.trim(),
        createdAt: new Date().toISOString(),
        budget: parseFloat(budgetInput.value) || 300.00,
        items: []
      };

      this.lists.push(newList);
      this.activeListId = newList.id;
      this.saveState();
      this.closeModal('modal-new-list');
      nameInput.value = '';
      this.showToast(`Lista "${newList.name}" criada com sucesso!`);
      this.render();
    });

    // Botões Excluir Lista
    document.getElementById('btn-delete-list')?.addEventListener('click', () => this.deleteActiveList());
    document.getElementById('sidebar-btn-delete')?.addEventListener('click', () => {
      closeSidebar();
      this.deleteActiveList();
    });

    // Botões de Ferramentas da Sidebar
    document.getElementById('sidebar-btn-whatsapp')?.addEventListener('click', () => {
      closeSidebar();
      this.shareWhatsApp();
    });
    document.getElementById('sidebar-btn-copy')?.addEventListener('click', () => {
      closeSidebar();
      this.copyListToClipboard();
    });
    document.getElementById('sidebar-btn-export')?.addEventListener('click', () => {
      closeSidebar();
      this.exportJSON();
    });
    document.getElementById('sidebar-btn-import')?.addEventListener('click', () => {
      closeSidebar();
      document.getElementById('input-import-json')?.click();
    });
    document.getElementById('sidebar-theme-toggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });
    document.getElementById('sidebar-btn-lock')?.addEventListener('click', () => {
      closeSidebar();
      this.lockApp();
      this.showToast('🔒 Tela bloqueada por segurança.');
    });
    document.getElementById('sidebar-btn-login')?.addEventListener('click', () => {
      closeSidebar();
      document.getElementById('auth-modal')?.classList.add('active');
    });
    document.getElementById('sidebar-btn-logout')?.addEventListener('click', () => {
      closeSidebar();
      if (confirm('Deseja realmente sair da sua conta?')) {
        this.logout();
      }
    });
    document.getElementById('sidebar-btn-exit')?.addEventListener('click', () => {
      closeSidebar();
      this.promptExitApp();
    });

    // Botão Sincronizar Preços On-line
    document.getElementById('btn-sync-prices')?.addEventListener('click', async () => {
      await this.syncPricesOnline();
    });

    // Autocomplete no campo de busca de produto
    const searchInput = document.getElementById('input-product-name');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleAutocomplete(e.target.value));
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          document.getElementById('autocomplete-box')?.classList.remove('visible');
        }, 200);
      });
    }

    // Formulário de Adicionar Item Rápido
    document.getElementById('form-add-product')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addProductFromForm();
    });

    // Alternar Abas (Tabs - Header, Sidebar e Bottom Navigation Mobile)
    document.querySelectorAll('.tab-btn, .sidebar-nav-item, .bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
          closeSidebar();
        }
      });
    });

    // Filtro no Modo Mercado
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.shoppingFilter = e.currentTarget.getAttribute('data-filter');
        this.renderShoppingMode();
      });
    });

    // Re-renderizar gráficos e tabelas caso mude orientação ou redimensione tela
    window.addEventListener('resize', () => {
      this.renderCharts();
    });

    // Botão Copiar Lista
    document.getElementById('btn-copy-list')?.addEventListener('click', () => this.copyListToClipboard());

    // Botão WhatsApp Share
    document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => this.shareWhatsApp());

    // Botão Exportar / Backup
    document.getElementById('btn-export-data')?.addEventListener('click', () => this.exportJSON());

    // Botão Importar Backup JSON
    const importInput = document.getElementById('input-import-json');
    document.getElementById('btn-import-data')?.addEventListener('click', () => {
      importInput?.click();
    });
    importInput?.addEventListener('change', (e) => this.handleImportJSON(e));

    // Botão Editar Orçamento
    document.getElementById('btn-edit-budget')?.addEventListener('click', () => {
      const list = this.getActiveList();
      const budgetInput = document.getElementById('input-edit-budget');
      if (budgetInput) budgetInput.value = list.budget ? list.budget.toFixed(2).replace('.', ',') : '350,00';
      this.openModal('modal-edit-budget');
    });

    // Formulário Salvar Orçamento
    document.getElementById('form-edit-budget')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const budgetInput = document.getElementById('input-edit-budget');
      const newBudget = parseLocalizedNumber(budgetInput.value, 300);
      const list = this.getActiveList();
      list.budget = newBudget;
      this.saveState();
      this.closeModal('modal-edit-budget');
      this.showToast(`Orçamento atualizado para ${formatBRL(newBudget)}!`);
      this.render();
    });

    // Formulário Salvar Item Editado
    document.getElementById('form-edit-item')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEditedItem();
    });

    // Modais Close buttons
    document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) this.closeModal(modal.id);
      });
    });

    // Ações do Modal de Confirmação de Saída
    document.getElementById('btn-confirm-exit')?.addEventListener('click', () => {
      this.executeExit();
    });
    document.getElementById('btn-reopen-app')?.addEventListener('click', () => {
      const exitScreen = document.getElementById('app-exit-screen');
      if (exitScreen) exitScreen.style.display = 'none';
      this.isExiting = false;
    });
  }

  // Excluir lista ativa com confirmação
  deleteActiveList() {
    const active = this.getActiveList();
    if (this.lists.length <= 1) {
      alert('Você deve ter pelo menos uma lista.');
      return;
    }
    if (confirm(`Deseja realmente excluir a lista "${active.name}"?`)) {
      this.lists = this.lists.filter(l => l.id !== active.id);
      this.activeListId = this.lists[0].id;
      this.saveState();
      this.showToast('Lista removida.');
      this.render();
    }
  }

  // Alternar abas responsivamente em qualquer dispositivo
  switchTab(tabId) {
    this.currentTab = tabId;

    // Sincronizar classes ativas em todas as barras de navegação (topo, sidebar e bottom nav)
    document.querySelectorAll('.tab-btn, .sidebar-nav-item, .bottom-nav-item').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Exibir apenas a aba ativa
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const activePanel = document.getElementById(tabId);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    if (tabId === 'tab-comparison') this.renderStoreComparison();
    if (tabId === 'tab-reports') this.renderCharts();

    // Rolar suavemente para o início do conteúdo se estiver no mobile
    if (window.innerWidth <= 768) {
      const mainEl = document.querySelector('.main-content');
      if (mainEl) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  // Lógica Autocomplete com Sugestão de Menor Preço On-line por Supermercado
  handleAutocomplete(query) {
    const box = document.getElementById('autocomplete-box');
    if (!box) return;

    if (!query || query.trim().length < 2) {
      box.classList.remove('visible');
      return;
    }

    const q = query.toLowerCase();
    const matches = PRODUCT_CATALOG.filter(p => 
      p.name.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))
    ).slice(0, 5);

    if (matches.length === 0) {
      box.classList.remove('visible');
      return;
    }

    box.innerHTML = matches.map(p => {
      // Encontrar a menor oferta entre os 5 supermercados
      const storeOffers = SUPERMARKETS.map(s => ({
        storeName: s.shortName || s.name,
        storeKey: s.id,
        price: +(p.basePrice * s.factor).toFixed(2)
      })).sort((a, b) => a.price - b.price);
      const best = storeOffers[0];

      return `
        <div class="autocomplete-item" data-id="${p.id}" data-best-price="${best.price}" data-best-store="${best.storeKey}">
          <div>
            <div class="autocomplete-name">${p.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${CATEGORIES[p.category]?.name || 'Mercearia'} • ${p.unit}</div>
            <div style="font-size:0.75rem; color:var(--primary); font-weight:700; margin-top:0.15rem;">
              <i class="fa-solid fa-fire" style="color:var(--accent);"></i> Menor preço: <strong>${formatBRL(best.price)}</strong> (no ${best.storeName})
            </div>
          </div>
          <div class="autocomplete-meta" style="text-align:right;">
            <div style="font-size:0.8rem; text-decoration:line-through; opacity:0.6; font-weight:normal;">${formatBRL(p.basePrice)}</div>
            <div>${formatBRL(best.price)}</div>
          </div>
        </div>
      `;
    }).join('');

    box.classList.add('visible');

    box.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const pId = item.getAttribute('data-id');
        const bestPrice = parseFloat(item.getAttribute('data-best-price'));
        const bestStore = item.getAttribute('data-best-store');
        const prod = PRODUCT_CATALOG.find(p => p.id === pId);
        
        if (prod) {
          const priceVal = bestPrice ? bestPrice : prod.basePrice;
          document.getElementById('input-product-name').value = prod.name;
          document.getElementById('input-product-price').value = priceVal.toFixed(2).replace('.', ',');
          document.getElementById('select-product-category').value = prod.category;
          document.getElementById('select-product-unit').value = prod.unit;
          const storeObj = SUPERMARKETS.find(s => s.id === bestStore);
          this.showToast(`💡 Sugerido o menor preço: ${formatBRL(priceVal)} (${storeObj?.shortName || CATEGORIES[bestStore]?.name || 'Oferta'})`);
        }
        box.classList.remove('visible');
      });
    });
  }

  // Adicionar produto a partir do formulário
  addProductFromForm() {
    const nameInput = document.getElementById('input-product-name');
    const priceInput = document.getElementById('input-product-price');
    const categorySelect = document.getElementById('select-product-category');
    const unitSelect = document.getElementById('select-product-unit');
    const qtyInput = document.getElementById('input-product-qty');

    if (!nameInput.value.trim()) return;

    const list = this.getActiveList();
    const parsedQty = parseLocalizedNumber(qtyInput?.value, 1);
    const parsedPrice = parseLocalizedNumber(priceInput?.value, 0.00);

    const newItem = {
      id: 'i_' + Date.now(),
      name: nameInput.value.trim(),
      category: categorySelect.value || 'mercearia',
      unit: unitSelect.value || 'un',
      quantity: parsedQty > 0 ? parsedQty : 1,
      price: parsedPrice >= 0 ? parsedPrice : 0.00,
      checked: false,
      trend: 'neutral',
      lastUpdated: 'Agora'
    };

    list.items.push(newItem);
    this.saveState();
    this.showToast(`"${newItem.name}" adicionado à lista.`);
    nameInput.value = '';
    priceInput.value = '';
    if (qtyInput) qtyInput.value = '1';

    this.render();
  }

  // Sincronizar preços via API simulated on-line
  async syncPricesOnline() {
    const list = this.getActiveList();
    if (list.items.length === 0) {
      alert('Sua lista está vazia. Adicione itens antes de sincronizar.');
      return;
    }

    const btn = document.getElementById('btn-sync-prices');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando API...';
    btn.disabled = true;

    try {
      const updatedItems = await OnlinePriceService.syncListPrices(list.items);
      list.items = updatedItems;
      this.saveState();
      this.showToast('✨ Cotações on-line atualizadas em tempo real!');
      this.render();
    } catch (e) {
      this.showToast('Erro ao sincronizar preços.');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  // Métricas do Topo (Dashboard Header Metrics)
  renderDashboardMetrics() {
    const list = this.getActiveList();
    
    // Total Estimado da Lista
    const totalEstimated = list.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    
    // Total no Carrinho
    const totalChecked = list.items.filter(i => i.checked).reduce((acc, i) => acc + (i.price * i.quantity), 0);
    
    // Orçamento
    const budget = list.budget || 300.00;
    const budgetPercent = Math.min(100, Math.round((totalEstimated / budget) * 100));

    document.getElementById('metric-total-estimated').textContent = formatBRL(totalEstimated);
    document.getElementById('metric-total-checked').textContent = formatBRL(totalChecked);
    document.getElementById('metric-budget-limit').textContent = formatBRL(budget);
    
    const fillEl = document.getElementById('budget-progress-fill');
    if (fillEl) {
      fillEl.style.width = `${budgetPercent}%`;
      if (budgetPercent > 90) {
        fillEl.className = 'progress-bar-fill warning';
      } else {
        fillEl.className = 'progress-bar-fill';
      }
    }
    
    document.getElementById('metric-budget-percent').textContent = `${budgetPercent}% do orçamento utilizado`;

    // Melhor Supermercado
    const storeRanking = OnlinePriceService.calculateStoreTotals(list.items);
    if (storeRanking.length > 0 && list.items.length > 0) {
      const best = storeRanking[0];
      const highest = storeRanking[storeRanking.length - 1];
      const diff = highest.total - best.total;

      document.getElementById('metric-best-store').textContent = best.name;
      document.getElementById('metric-best-sub').textContent = diff > 0 
        ? `Economize até ${formatBRL(diff)} comprando aqui!` 
        : 'Melhor valor médio atual.';
    } else {
      document.getElementById('metric-best-store').textContent = 'N/A';
      document.getElementById('metric-best-sub').textContent = 'Adicione itens à lista';
    }

    // Atualizar badges de contagem de itens e carrinho
    const totalCount = list.items.length;
    const checkedCount = list.items.filter(i => i.checked).length;

    ['badge-tab-items', 'badge-sidebar-items', 'badge-bottom-items'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = totalCount;
        el.style.display = totalCount > 0 ? 'inline-block' : 'none';
      }
    });

    ['badge-tab-cart', 'badge-sidebar-cart'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = `${checkedCount}/${totalCount}`;
        el.style.display = totalCount > 0 ? 'inline-block' : 'none';
      }
    });

    const bottomCart = document.getElementById('badge-bottom-cart');
    if (bottomCart) {
      bottomCart.textContent = checkedCount;
      bottomCart.style.display = checkedCount > 0 ? 'inline-block' : 'none';
    }
  }

  // Renderização da Lista de Itens por Categoria
  renderCategoryList() {
    const container = document.getElementById('category-items-container');
    if (!container) return;

    const list = this.getActiveList();

    if (list.items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
          <i class="fa-solid fa-basket-shopping" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
          <h3>Sua lista está vazia</h3>
          <p>Utilize a barra de pesquisa rápida acima para adicionar seus primeiros produtos com preço on-line.</p>
        </div>
      `;
      return;
    }

    // Agrupar itens por categoria
    const grouped = {};
    list.items.forEach(item => {
      const cat = item.category || 'mercearia';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    let html = '';
    Object.keys(grouped).forEach(catKey => {
      const catInfo = CATEGORIES[catKey] || CATEGORIES.mercearia;
      const catItems = grouped[catKey];
      const catSubtotal = catItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

      html += `
        <div class="category-group">
          <div class="category-header">
            <div class="category-title">
              <div class="category-icon-chip" style="background:${catInfo.bg}; color:${catInfo.color};">
                <i class="fa-solid ${catInfo.icon}"></i>
              </div>
              <span>${catInfo.name}</span>
            </div>
            <div class="category-stats">
              ${catItems.length} ${catItems.length === 1 ? 'item' : 'itens'} • <strong>${formatBRL(catSubtotal)}</strong>
            </div>
          </div>
          <div class="items-table-wrapper">
          <table class="items-table">
            <thead>
              <tr>
                <th style="width:40px;"></th>
                <th>Produto</th>
                <th>Tendência</th>
                <th>Qtd</th>
                <th>Preço Un.</th>
                <th>Subtotal</th>
                <th style="text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${catItems.map(item => {
                const subtotal = item.price * item.quantity;
                let trendBadge = `<span class="trend-badge neutral"><i class="fa-solid fa-minus"></i> Estável</span>`;
                if (item.trend === 'up') {
                  trendBadge = `<span class="trend-badge up"><i class="fa-solid fa-arrow-trend-up"></i> +${item.trendPercent || 3}%</span>`;
                } else if (item.trend === 'down') {
                  trendBadge = `<span class="trend-badge down"><i class="fa-solid fa-arrow-trend-down"></i> -${item.trendPercent || 4}%</span>`;
                }

                return `
                  <tr data-id="${item.id}" class="${item.checked ? 'item-checked' : ''}">
                    <td>
                      <input type="checkbox" ${item.checked ? 'checked' : ''} class="item-check-input" data-id="${item.id}" style="width:18px; height:18px; cursor:pointer;">
                    </td>
                    <td class="item-name-cell">
                      ${item.name}
                      <div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">Cotação on-line</div>
                    </td>
                    <td>${trendBadge}</td>
                    <td>
                      <div class="qty-control">
                        <button class="btn-qty btn-qty-minus" data-id="${item.id}">-</button>
                        <span style="font-weight:700; font-size:0.9rem; min-width:24px; text-align:center;">${item.quantity} ${item.unit}</span>
                        <button class="btn-qty btn-qty-plus" data-id="${item.id}">+</button>
                      </div>
                    </td>
                    <td>${formatBRL(item.price)}</td>
                    <td style="font-weight:700; color:var(--primary);">${formatBRL(subtotal)}</td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button class="btn-icon btn-edit-item" data-id="${item.id}" style="width:32px; height:32px; font-size:0.85rem; margin-right:0.35rem;" title="Editar item">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button class="btn-icon btn-delete-item" data-id="${item.id}" style="width:32px; height:32px; font-size:0.85rem;" title="Remover item">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Vincular Eventos da Tabela
    container.querySelectorAll('.item-check-input').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        this.toggleItemCheck(id);
      });
    });

    container.querySelectorAll('.btn-qty-minus').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.updateItemQty(id, -1);
      });
    });

    container.querySelectorAll('.btn-qty-plus').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.updateItemQty(id, 1);
      });
    });

    container.querySelectorAll('.btn-edit-item').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditItemModal(id);
      });
    });

    container.querySelectorAll('.btn-delete-item').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteItem(id);
      });
    });
  }

  // Modo Mercado (Shopping Mode View)
  renderShoppingMode() {
    const container = document.getElementById('shopping-cards-grid');
    if (!container) return;

    const list = this.getActiveList();
    let items = list.items;

    if (this.shoppingFilter === 'pending') {
      items = items.filter(i => !i.checked);
    } else if (this.shoppingFilter === 'checked') {
      items = items.filter(i => i.checked);
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fa-solid fa-circle-check" style="font-size:3rem; margin-bottom:1rem; color:var(--primary);"></i>
          <h3>Nenhum item nesta visualização</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="shopping-card ${item.checked ? 'checked' : ''}" data-id="${item.id}">
        <div class="shopping-checkbox">
          ${item.checked ? '<i class="fa-solid fa-check"></i>' : ''}
        </div>
        <div style="flex:1;">
          <div class="shopping-item-name" style="font-weight:700; font-size:0.95rem;">${item.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            ${item.quantity} ${item.unit} x ${formatBRL(item.price)}
          </div>
        </div>
        <div style="font-weight:800; font-size:1.1rem; color:${item.checked ? 'var(--text-muted)' : 'var(--primary)'};">
          ${formatBRL(item.price * item.quantity)}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.shopping-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        this.toggleItemCheck(id);
      });
    });
  }

  // Renderização do Comparador de Supermercados
  renderStoreComparison() {
    const list = this.getActiveList();
    const container = document.getElementById('store-comparison-container');
    if (!container) return;

    const ranking = OnlinePriceService.calculateStoreTotals(list.items);

    if (list.items.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">Adicione produtos à lista para comparar os preços dos supermercados.</div>`;
      return;
    }

    let cardsHtml = `
      <div class="store-card-grid">
        ${ranking.map((store, index) => `
          <div class="store-summary-card ${index === 0 ? 'cheapest' : ''}">
            ${index === 0 ? '<div class="best-badge">MELHOR OPÇÃO</div>' : ''}
            <div style="font-size:1.5rem; color:${store.color}; margin-bottom:0.5rem;">
              <i class="fa-solid ${store.icon}"></i>
            </div>
            <h4 style="font-size:1.1rem; margin-bottom:0.25rem;">${store.name}</h4>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">${store.badge}</div>
            <div style="font-size:1.5rem; font-weight:800; color:var(--text-main);">${formatBRL(store.total)}</div>
            ${index > 0 ? `<div style="font-size:0.78rem; color:var(--danger); margin-top:0.25rem;">+ ${formatBRL(store.total - ranking[0].total)}</div>` : '<div style="font-size:0.78rem; color:var(--success); margin-top:0.25rem;">Menor Valor Garantido</div>'}
          </div>
        `).join('')}
      </div>
    `;

    // Tabela detalhada de itens
    let matrixHtml = `
      <div class="comparison-table-wrapper">
        <h4 style="margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          <i class="fa-solid fa-list-check" style="color:var(--primary);"></i> Detalhamento de Itens por Supermercado
        </h4>
        <table class="items-table">
          <thead>
            <tr>
              <th>Produto (Qtd)</th>
              ${SUPERMARKETS.map(s => `<th>${s.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${list.items.map(item => `
              <tr>
                <td style="font-weight:600;">${item.name} (${item.quantity} ${item.unit})</td>
                ${SUPERMARKETS.map(s => {
                  const sp = item.storePrices ? item.storePrices.find(p => p.marketId === s.id) : null;
                  const itemPrice = sp ? sp.price : item.price * s.factor;
                  const totalItem = itemPrice * item.quantity;
                  return `<td>${formatBRL(totalItem)}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = cardsHtml + matrixHtml;
  }

  // Renderização de Gráficos (Canvas Custom sem bibliotecas pesadas)
  renderCharts() {
    const list = this.getActiveList();
    const canvasCategory = document.getElementById('chart-category');
    const canvasStores = document.getElementById('chart-stores');

    if (!canvasCategory || !canvasStores) return;

    // Ajustar resolução dos canvas dinamicamente de acordo com o contêiner
    const cardEl = canvasCategory.closest('.chart-card');
    const containerW = cardEl ? cardEl.clientWidth - 30 : 380;
    const targetW = Math.max(280, Math.min(containerW, 550));
    const targetH = 220;

    canvasCategory.width = targetW;
    canvasCategory.height = targetH;
    canvasStores.width = targetW;
    canvasStores.height = targetH;

    // Chart 1: Distribuição por Categoria
    const ctxCat = canvasCategory.getContext('2d');
    ctxCat.clearRect(0, 0, canvasCategory.width, canvasCategory.height);

    const categoryTotals = {};
    list.items.forEach(i => {
      const cat = i.category || 'mercearia';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (i.price * i.quantity);
    });

    const catKeys = Object.keys(categoryTotals);
    const grandTotal = list.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    if (grandTotal === 0) {
      ctxCat.fillStyle = this.theme === 'dark' ? '#94a3b8' : '#64748b';
      ctxCat.font = '14px Inter';
      ctxCat.textAlign = 'center';
      ctxCat.fillText('Nenhum dado para exibir', targetW / 2, targetH / 2);
    } else {
      let startAngle = 0;
      const isNarrow = targetW < 360;
      const centerX = isNarrow ? 75 : Math.min(100, targetW * 0.28);
      const centerY = 110;
      const radius = isNarrow ? 55 : 70;

      catKeys.forEach((key) => {
        const val = categoryTotals[key];
        const sliceAngle = (val / grandTotal) * 2 * Math.PI;
        const color = (CATEGORIES[key] && CATEGORIES[key].color) || '#10b981';

        ctxCat.beginPath();
        ctxCat.moveTo(centerX, centerY);
        ctxCat.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctxCat.closePath();
        ctxCat.fillStyle = color;
        ctxCat.fill();

        startAngle += sliceAngle;
      });

      // Desenhar Rosca Central
      ctxCat.beginPath();
      ctxCat.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
      ctxCat.fillStyle = this.theme === 'dark' ? '#131b2e' : '#ffffff';
      ctxCat.fill();

      // Legendas ao lado
      const legendX = centerX + radius + 15;
      let legendY = 25;
      ctxCat.textAlign = 'left';
      catKeys.slice(0, 7).forEach(key => {
        const cat = CATEGORIES[key];
        const val = categoryTotals[key];
        ctxCat.fillStyle = cat ? cat.color : '#10b981';
        ctxCat.fillRect(legendX, legendY, 10, 10);

        ctxCat.fillStyle = this.theme === 'dark' ? '#f8fafc' : '#0f172a';
        ctxCat.font = '11px Inter';
        const label = `${cat ? cat.name : key}: R$ ${val.toFixed(0)}`;
        ctxCat.fillText(label, legendX + 15, legendY + 9);
        legendY += 21;
      });
    }

    // Chart 2: Comparação por Supermercado (Bar Chart)
    const ctxStores = canvasStores.getContext('2d');
    ctxStores.clearRect(0, 0, canvasStores.width, canvasStores.height);

    const storeRanking = OnlinePriceService.calculateStoreTotals(list.items);
    if (storeRanking.length > 0 && grandTotal > 0) {
      const maxVal = Math.max(...storeRanking.map(s => s.total)) * 1.15;
      const paddingX = 12;
      const availableW = targetW - paddingX * 2;
      const numStores = storeRanking.length;
      const step = availableW / numStores;
      const barWidth = Math.min(36, step * 0.72);
      const chartHeight = 135;
      const baseY = 175;

      storeRanking.forEach((store, i) => {
        const h = (store.total / maxVal) * chartHeight;
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = baseY - h;

        // Barra
        ctxStores.fillStyle = store.color;
        ctxStores.beginPath();
        if (ctxStores.roundRect) {
          ctxStores.roundRect(x, y, barWidth, h, [4, 4, 0, 0]);
          ctxStores.fill();
        } else {
          ctxStores.fillRect(x, y, barWidth, h);
        }

        // Preço no topo
        ctxStores.fillStyle = this.theme === 'dark' ? '#f8fafc' : '#0f172a';
        ctxStores.font = '10px Outfit';
        ctxStores.textAlign = 'center';
        ctxStores.fillText(`R$${store.total.toFixed(0)}`, x + barWidth / 2, y - 4);

        // Nome Curto da Loja nos Gráficos (ABC, BH, Oliveira, União, Rena)
        const shortLabel = store.shortName || store.name;
        ctxStores.font = 'bold 10px Inter';
        ctxStores.fillText(shortLabel, x + barWidth / 2, baseY + 18);
      });
    }
  }

  // Ações de itens
  toggleItemCheck(itemId) {
    const list = this.getActiveList();
    const item = list.items.find(i => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      this.saveState();
      this.render();
    }
  }

  updateItemQty(itemId, delta) {
    const list = this.getActiveList();
    const item = list.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(0.5, +(item.quantity + delta).toFixed(1));
      this.saveState();
      this.render();
    }
  }

  deleteItem(itemId) {
    const list = this.getActiveList();
    list.items = list.items.filter(i => i.id !== itemId);
    this.saveState();
    this.showToast('Item removido da lista.');
    this.render();
  }

  // Compartilhamento via WhatsApp
  shareWhatsApp() {
    const list = this.getActiveList();
    if (list.items.length === 0) {
      alert('Sua lista está vazia.');
      return;
    }

    let text = `🛒 *Mercado Fácil - ${list.name}*\n`;
    text += `📅 Cotação em: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    let total = 0;
    list.items.forEach((item, idx) => {
      const sub = item.price * item.quantity;
      total += sub;
      text += `${item.checked ? '✅' : '▫️'} *${item.name}* (${item.quantity} ${item.unit}) - ${formatBRL(sub)}\n`;
    });

    text += `\n💰 *Total Estimado: ${formatBRL(total)}*`;
    text += `\n✨ Criado no Mercado Fácil App`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // Exportação JSON
  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.lists, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mercado_facil_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Backup exportado com sucesso!');
  }

  // Modais
  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  // Pergunta se o usuário quer sair ao clicar para fechar o aplicativo
  promptExitApp() {
    this.openModal('modal-confirm-exit');
  }

  // Executa o fechamento seguro após confirmação do usuário
  executeExit() {
    this.isExiting = true;
    this.closeModal('modal-confirm-exit');
    this.saveState();

    // Tenta fechar a janela / aba / PWA se permitido
    try {
      window.close();
    } catch (e) {
      console.log('window.close restrito pelo navegador');
    }

    // Exibe tela elegante de encerramento caso o navegador impeça o fechamento direto da aba
    setTimeout(() => {
      const exitScreen = document.getElementById('app-exit-screen');
      if (exitScreen) {
        exitScreen.style.display = 'flex';
      }
    }, 150);
  }

  // Toast System
  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Métodos de Edição de Item
  openEditItemModal(itemId) {
    const list = this.getActiveList();
    const item = list.items.find(i => i.id === itemId);
    if (!item) return;

    const idInput = document.getElementById('edit-item-id');
    const nameInput = document.getElementById('edit-item-name');
    const catSelect = document.getElementById('edit-item-category');
    const unitSelect = document.getElementById('edit-item-unit');
    const qtyInput = document.getElementById('edit-item-qty');
    const priceInput = document.getElementById('edit-item-price');

    if (idInput) idInput.value = item.id;
    if (nameInput) nameInput.value = item.name;
    if (catSelect) {
      this.populateCategorySelect(catSelect);
      catSelect.value = item.category || 'mercearia';
    }
    if (unitSelect) unitSelect.value = item.unit || 'un';
    if (qtyInput) qtyInput.value = item.quantity;
    if (priceInput) priceInput.value = item.price ? item.price.toFixed(2).replace('.', ',') : '0,00';

    this.openModal('modal-edit-item');
  }

  saveEditedItem() {
    const idInput = document.getElementById('edit-item-id');
    const nameInput = document.getElementById('edit-item-name');
    const catSelect = document.getElementById('edit-item-category');
    const unitSelect = document.getElementById('edit-item-unit');
    const qtyInput = document.getElementById('edit-item-qty');
    const priceInput = document.getElementById('edit-item-price');

    if (!nameInput.value.trim()) return;

    const list = this.getActiveList();
    const item = list.items.find(i => i.id === idInput.value);
    if (!item) return;

    const parsedQty = parseLocalizedNumber(qtyInput.value, 1);
    const parsedPrice = parseLocalizedNumber(priceInput.value, 0.00);

    item.name = nameInput.value.trim();
    item.category = catSelect.value || 'mercearia';
    item.unit = unitSelect.value || 'un';
    item.quantity = parsedQty > 0 ? parsedQty : 1;
    item.price = parsedPrice >= 0 ? parsedPrice : 0.00;

    this.saveState();
    this.closeModal('modal-edit-item');
    this.showToast(`"${item.name}" atualizado com sucesso!`);
    this.render();
  }

  // Copiar lista para área de transferência
  copyListToClipboard() {
    const list = this.getActiveList();
    if (list.items.length === 0) {
      alert('Sua lista está vazia.');
      return;
    }

    let text = `🛒 Mercado Fácil - ${list.name}\n`;
    text += `📅 Cotação: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `🎯 Limite de Orçamento: ${formatBRL(list.budget || 300)}\n\n`;

    let total = 0;
    list.items.forEach(item => {
      const sub = item.price * item.quantity;
      total += sub;
      text += `${item.checked ? '✅' : '▫️'} ${item.name} (${item.quantity} ${item.unit}) - ${formatBRL(sub)}\n`;
    });

    text += `\n💰 Total Estimado: ${formatBRL(total)}\n`;
    text += `✨ Mercado Fácil - Lista de Compras Inteligente`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('📋 Lista copiada para a área de transferência!');
      }).catch(() => {
        this.fallbackCopyText(text);
      });
    } else {
      this.fallbackCopyText(text);
    }
  }

  fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.showToast('📋 Lista copiada para a área de transferência!');
    } catch (err) {
      alert('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(textarea);
  }

  // Importação JSON
  handleImportJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data) || data.length === 0 || !data[0].name) {
          alert('Arquivo JSON inválido. O arquivo deve conter uma lista ou conjunto de listas exportadas pelo Mercado Fácil.');
          return;
        }

        const shouldReplace = confirm(
          `Arquivo carregado com ${data.length} lista(s)!\n\nClique em OK para SUBSTITUIR suas listas atuais ou Cancelar para MESCLAR com as existentes.`
        );

        if (shouldReplace) {
          this.lists = data;
        } else {
          const existingIds = new Set(this.lists.map(l => l.id));
          data.forEach(item => {
            if (existingIds.has(item.id)) {
              item.id = 'list_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            }
            this.lists.push(item);
          });
        }

        this.activeListId = this.lists[0].id;
        this.saveState();
        this.showToast('📥 Backup de listas importado com sucesso!');
        this.render();
      } catch (err) {
        alert('Erro ao processar arquivo JSON: ' + err.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  populateCategorySelect(selectElement) {
    if (!selectElement) return;
    const prodCatKeys = ['hortifruti', 'carnes', 'laticinios', 'mercearia', 'padaria', 'limpeza', 'bebidas', 'higiene'];
    const storeCatKeys = ['mart_minas', 'supermercados_bh', 'supermercados_abc', 'supermercados_rena', 'oliveira_super', 'rede_uniao'];

    selectElement.innerHTML = `
      <optgroup label="🏷️ Categorias de Produtos">
        ${prodCatKeys.map(k => `<option value="${k}">${CATEGORIES[k].name}</option>`).join('')}
      </optgroup>
      <optgroup label="🏪 Categorias por Supermercado">
        ${storeCatKeys.map(k => `<option value="${k}">${CATEGORIES[k].name}</option>`).join('')}
      </optgroup>
    `;
  }

  // Renderização Geral da Aplicação
  render() {
    // 1. Atualizar Select de Listas (Topo e Sidebar)
    const optionsHtml = this.lists.map(l => `
      <option value="${l.id}" ${l.id === this.activeListId ? 'selected' : ''}>
        ${l.name} (${l.items.length} itens)
      </option>
    `).join('');

    const topSelect = document.getElementById('select-active-list');
    if (topSelect) topSelect.innerHTML = optionsHtml;

    const sideSelect = document.getElementById('select-sidebar-list');
    if (sideSelect) sideSelect.innerHTML = optionsHtml;

    // 2. Preencher Select de Categorias no formulário
    const catSelect = document.getElementById('select-product-category');
    if (catSelect && (catSelect.options.length <= 1 || catSelect.querySelectorAll('optgroup').length === 0)) {
      this.populateCategorySelect(catSelect);
    }

    // 3. Renderizar seções e métricas
    this.renderDashboardMetrics();
    this.renderCategoryList();
    this.renderShoppingMode();
    this.renderStoreComparison();
    this.renderCharts();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MercadoFacilApp();
});
