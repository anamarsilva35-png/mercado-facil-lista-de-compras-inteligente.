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

class MercadoFacilApp {
  constructor() {
    this.lists = [];
    this.activeListId = null;
    this.currentTab = 'tab-items';
    this.theme = 'light';
    this.shoppingFilter = 'all';
    this.users = [];
    this.currentUser = null;

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

    // Carregar Contas de Usuários
    const savedUsers = localStorage.getItem('mf_users');
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers);
      } catch (e) {
        this.users = [{ username: 'usuario', name: 'Ana Maria', password: '123456' }];
      }
    } else {
      this.users = [{ username: 'usuario', name: 'Ana Maria', password: '123456' }];
      localStorage.setItem('mf_users', JSON.stringify(this.users));
    }

    // Carregar Sessão do Usuário Atual
    const savedCurrentUser = localStorage.getItem('mf_current_user');
    if (savedCurrentUser) {
      try {
        this.currentUser = JSON.parse(savedCurrentUser);
      } catch (e) {
        this.currentUser = null;
      }
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

  // Gerenciamento de Autenticação (Login / Cadastro / Logout)
  setupAuth() {
    const authModal = document.getElementById('auth-modal');
    const userChip = document.getElementById('user-profile-chip');
    const logoutBtn = document.getElementById('btn-logout');
    const userNameEl = document.getElementById('user-display-name');
    const userAvatarEl = document.getElementById('user-avatar-initials');

    if (this.currentUser) {
      if (authModal) authModal.classList.remove('active');
      if (userChip) userChip.style.display = 'flex';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      
      const rawName = (this.currentUser.name || this.currentUser.username || 'Usuário').trim();
      const firstName = rawName.split(' ')[0];
      if (userNameEl) userNameEl.textContent = `Olá, ${firstName}`;
      
      if (userAvatarEl) {
        const initials = firstName.substring(0, 1).toUpperCase();
        userAvatarEl.textContent = initials;
      }
    } else {
      if (authModal) authModal.classList.add('active');
      if (userChip) userChip.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  login(username, password) {
    const foundUser = this.users.find(u => 
      u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
    );

    if (foundUser) {
      this.currentUser = { username: foundUser.username, name: foundUser.name };
      this.saveState();
      this.setupAuth();
      this.showToast(`✨ Bem-vindo(a) de volta, ${foundUser.name}!`);
      this.render();
      return true;
    } else {
      alert('Usuário ou senha incorretos. Verifique suas credenciais ou use a Conta Demo.');
      return false;
    }
  }

  register(name, username, password) {
    const exists = this.users.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (exists) {
      alert('Este nome de usuário já está cadastrado. Escolha outro usuário.');
      return false;
    }

    const newUser = { name: name.trim(), username: username.trim(), password };
    this.users.push(newUser);
    this.currentUser = { username: newUser.username, name: newUser.name };
    this.saveState();
    this.setupAuth();
    this.showToast(`🎉 Conta criada com sucesso! Bem-vindo(a), ${newUser.name}!`);
    this.render();
    return true;
  }

  logout() {
    this.currentUser = null;
    this.saveState();
    this.setupAuth();
    this.showToast('Sua sessão foi encerrada com sucesso.');
  }

  setupTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = this.theme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    }
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

    // Eventos de Autenticação (Login / Cadastro)
    document.getElementById('tab-auth-login')?.addEventListener('click', () => {
      document.getElementById('tab-auth-login').classList.add('active');
      document.getElementById('tab-auth-register').classList.remove('active');
      document.getElementById('form-auth-login').style.display = 'block';
      document.getElementById('form-auth-register').style.display = 'none';
    });

    document.getElementById('tab-auth-register')?.addEventListener('click', () => {
      document.getElementById('tab-auth-register').classList.add('active');
      document.getElementById('tab-auth-login').classList.remove('active');
      document.getElementById('form-auth-register').style.display = 'block';
      document.getElementById('form-auth-login').style.display = 'none';
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

    // Botão Preencher com Conta Google
    document.getElementById('btn-fill-google-user')?.addEventListener('click', () => {
      this.currentUser = { username: 'google_user', name: 'Ana Maria Silva (Google)' };
      this.saveState();
      this.setupAuth();
      this.showToast('🌐 Autenticado com sucesso via Conta Google!');
      this.render();
    });

    // Alternar visibilidade da senha
    document.getElementById('btn-toggle-password-login')?.addEventListener('click', () => {
      const input = document.getElementById('auth-login-password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('btn-toggle-password-reg')?.addEventListener('click', () => {
      const input = document.getElementById('auth-reg-password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Botão Sair / Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da sua conta?')) {
        this.logout();
      }
    });

    // Seleção de lista ativa
    document.getElementById('select-active-list')?.addEventListener('change', (e) => {
      this.activeListId = e.target.value;
      this.saveState();
      this.render();
    });

    // Botão Nova Lista
    document.getElementById('btn-new-list')?.addEventListener('click', () => {
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

    // Botão Excluir Lista
    document.getElementById('btn-delete-list')?.addEventListener('click', () => {
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

    // Alternar Abas (Tabs)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
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

    // Botão WhatsApp Share
    document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => this.shareWhatsApp());

    // Botão Exportar / Backup
    document.getElementById('btn-export-data')?.addEventListener('click', () => this.exportJSON());

    // Modais Close buttons
    document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) this.closeModal(modal.id);
      });
    });
  }

  // Alternar abas
  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activePanel = document.getElementById(tabId);

    if (activeBtn) activeBtn.classList.add('active');
    if (activePanel) activePanel.classList.add('active');

    if (tabId === 'tab-comparison') this.renderStoreComparison();
    if (tabId === 'tab-reports') this.renderCharts();
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
          document.getElementById('input-product-name').value = prod.name;
          document.getElementById('input-product-price').value = bestPrice ? bestPrice.toFixed(2) : prod.basePrice.toFixed(2);
          document.getElementById('select-product-category').value = prod.category;
          document.getElementById('select-product-unit').value = prod.unit;
          this.showToast(`💡 Sugerido o menor preço: ${formatBRL(bestPrice)} (${CATEGORIES[bestStore]?.name || 'Oferta'})`);
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
    const newItem = {
      id: 'i_' + Date.now(),
      name: nameInput.value.trim(),
      category: categorySelect.value || 'mercearia',
      unit: unitSelect.value || 'un',
      quantity: parseFloat(qtyInput.value) || 1,
      price: parseFloat(priceInput.value) || 0.00,
      checked: false,
      trend: 'neutral',
      lastUpdated: 'Agora'
    };

    list.items.push(newItem);
    this.saveState();
    this.showToast(`"${newItem.name}" adicionado à lista.`);
    nameInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';

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
                    <td style="text-align:right;">
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
      ctxCat.fillText('Nenhum dado para exibir', 80, 100);
    } else {
      let startAngle = 0;
      const centerX = 100;
      const centerY = 100;
      const radius = 70;

      catKeys.forEach((key, idx) => {
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
      ctxCat.arc(centerX, centerY, 45, 0, 2 * Math.PI);
      ctxCat.fillStyle = this.theme === 'dark' ? '#131b2e' : '#ffffff';
      ctxCat.fill();

      // Legendas ao lado
      let legendY = 30;
      catKeys.forEach(key => {
        const cat = CATEGORIES[key];
        const val = categoryTotals[key];
        ctxCat.fillStyle = cat ? cat.color : '#10b981';
        ctxCat.fillRect(210, legendY, 12, 12);

        ctxCat.fillStyle = this.theme === 'dark' ? '#f8fafc' : '#0f172a';
        ctxCat.font = '12px Inter';
        ctxCat.fillText(`${cat ? cat.name : key}: R$ ${val.toFixed(2)}`, 230, legendY + 10);
        legendY += 22;
      });
    }

    // Chart 2: Comparação por Supermercado (Bar Chart)
    const ctxStores = canvasStores.getContext('2d');
    ctxStores.clearRect(0, 0, canvasStores.width, canvasStores.height);

    const storeRanking = OnlinePriceService.calculateStoreTotals(list.items);
    if (storeRanking.length > 0 && grandTotal > 0) {
      const maxVal = Math.max(...storeRanking.map(s => s.total)) * 1.15;
      const barWidth = 45;
      const startX = 30;
      const chartHeight = 150;

      storeRanking.forEach((store, i) => {
        const h = (store.total / maxVal) * chartHeight;
        const x = startX + i * 75;
        const y = 170 - h;

        // Barra
        ctxStores.fillStyle = store.color;
        ctxStores.fillRect(x, y, barWidth, h);

        // Preço no topo
        ctxStores.fillStyle = this.theme === 'dark' ? '#f8fafc' : '#0f172a';
        ctxStores.font = '11px Outfit';
        ctxStores.textAlign = 'center';
        ctxStores.fillText(`R$${store.total.toFixed(0)}`, x + barWidth / 2, y - 5);

        // Nome Curto da Loja nos Gráficos (ABC, BH, Oliveira, União, Rena)
        const shortLabel = store.shortName || store.name;
        ctxStores.font = 'bold 11px Inter';
        ctxStores.fillText(shortLabel, x + barWidth / 2, 188);
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

  // Renderização Geral da Aplicação
  render() {
    // 1. Atualizar Select de Listas
    const select = document.getElementById('select-active-list');
    if (select) {
      select.innerHTML = this.lists.map(l => `
        <option value="${l.id}" ${l.id === this.activeListId ? 'selected' : ''}>
          ${l.name} (${l.items.length} itens)
        </option>
      `).join('');
    }

    // 2. Preencher Select de Categorias no formulário (Com Grupos de Supermercados)
    const catSelect = document.getElementById('select-product-category');
    if (catSelect && (catSelect.options.length <= 1 || catSelect.querySelectorAll('optgroup').length === 0)) {
      const prodCatKeys = ['hortifruti', 'carnes', 'laticinios', 'mercearia', 'padaria', 'limpeza', 'bebidas', 'higiene'];
      const storeCatKeys = ['supermercados_bh', 'supermercados_abc', 'supermercados_rena', 'oliveira_super', 'rede_uniao'];

      catSelect.innerHTML = `
        <optgroup label="🏷️ Categorias de Produtos">
          ${prodCatKeys.map(k => `<option value="${k}">${CATEGORIES[k].name}</option>`).join('')}
        </optgroup>
        <optgroup label="🏪 Categorias por Supermercado">
          ${storeCatKeys.map(k => `<option value="${k}">${CATEGORIES[k].name}</option>`).join('')}
        </optgroup>
      `;
    }

    // 3. Renderizar seções
    this.renderDashboardMetrics();
    this.renderCategoryList();
    this.renderShoppingMode();
    if (this.currentTab === 'tab-comparison') this.renderStoreComparison();
    if (this.currentTab === 'tab-reports') this.renderCharts();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MercadoFacilApp();
});
