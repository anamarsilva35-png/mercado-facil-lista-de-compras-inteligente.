/**
 * Mercado Fácil - Base de Dados de Cotações Online & Catalogo de Produtos
 * Simula API de preços em tempo real com consulta a diferentes redes de supermercados.
 */

const SUPERMARKETS = [
  { id: 'supermercados_bh', name: 'Supermercados BH', shortName: 'BH', color: '#dc2626', badge: 'Meu BH • Líder em Ofertas', factor: 0.91, icon: 'fa-cart-shopping' },
  { id: 'supermercados_abc', name: 'Supermercados ABC', shortName: 'ABC', color: '#2563eb', badge: 'Atacado & Varejo', factor: 0.93, icon: 'fa-store' },
  { id: 'supermercados_rena', name: 'Supermercados Rena', shortName: 'Rena', color: '#ea580c', badge: 'Meu Rena • Tradição & Qualidade', factor: 0.96, icon: 'fa-bag-shopping' },
  { id: 'oliveira_super', name: 'Oliveira Super', shortName: 'Oliveira', color: '#16a34a', badge: 'Oferta Diária Garantida', factor: 0.92, icon: 'fa-basket-shopping' },
  { id: 'rede_uniao', name: 'Rede União', shortName: 'União', color: '#8b5cf6', badge: 'Clube de Vantagens', factor: 0.95, icon: 'fa-tags' }
];

const CATEGORIES = {
  hortifruti: { name: 'Hortifrúti', icon: 'fa-apple-whole', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  carnes: { name: 'Carnes & Aves', icon: 'fa-drumstick-bite', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
  laticinios: { name: 'Laticínios & Frios', icon: 'fa-cheese', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  mercearia: { name: 'Mercearia', icon: 'fa-wheat-awn', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  padaria: { name: 'Padaria & Confeitaria', icon: 'fa-bread-slice', color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)' },
  limpeza: { name: 'Produtos de Limpeza', icon: 'fa-spray-can-sparkles', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  bebidas: { name: 'Bebidas', icon: 'fa-wine-bottle', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  higiene: { name: 'Higiene & Cuidados', icon: 'fa-pump-soap', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  // Categorias por Nome do Supermercado
  supermercados_bh: { name: 'Supermercados BH', icon: 'fa-cart-shopping', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)' },
  supermercados_abc: { name: 'Supermercados ABC', icon: 'fa-store', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)' },
  supermercados_rena: { name: 'Supermercados Rena', icon: 'fa-bag-shopping', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)' },
  oliveira_super: { name: 'Oliveira Super', icon: 'fa-basket-shopping', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.15)' },
  rede_uniao: { name: 'Rede União', icon: 'fa-tags', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }
};

const PRODUCT_CATALOG = [
  // Mercearia
  { id: 'p1', name: 'Arroz Tipo 1 5kg', category: 'mercearia', unit: 'pct', basePrice: 28.90, keywords: ['arroz', 'camil', 'tio joao', 'prato fino'] },
  { id: 'p2', name: 'Feijão Carioca 1kg', category: 'mercearia', unit: 'pct', basePrice: 8.49, keywords: ['feijao', 'kicaldo', 'camacho'] },
  { id: 'p3', name: 'Azeite de Oliva Extra Virgem 500ml', category: 'mercearia', unit: 'un', basePrice: 34.90, keywords: ['azeite', 'gallo', 'borges', 'andorinha'] },
  { id: 'p4', name: 'Café Torrado e Moído 500g', category: 'mercearia', unit: 'pct', basePrice: 19.80, keywords: ['cafe', 'pilao', 'caboclo', '3 coracoes'] },
  { id: 'p5', name: 'Açúcar Refinado 1kg', category: 'mercearia', unit: 'pct', basePrice: 4.69, keywords: ['acucar', 'uniao', 'alto alegre'] },
  { id: 'p6', name: 'Óleo de Soja 900ml', category: 'mercearia', unit: 'un', basePrice: 6.89, keywords: ['oleo', 'soja', 'liza', 'soya', 'concordia'] },
  { id: 'p7', name: 'Macarrão Espaguete nº 8 500g', category: 'mercearia', unit: 'pct', basePrice: 4.29, keywords: ['macarrao', 'massa', 'barilla', 'renata', 'adria'] },
  { id: 'p8', name: 'Molho de Tomate Tradicional 300g', category: 'mercearia', unit: 'un', basePrice: 2.99, keywords: ['molho', 'tomate', 'tarantella', 'fugini', 'elephant'] },
  { id: 'p9', name: 'Farinha de Trigo 1kg', category: 'mercearia', unit: 'pct', basePrice: 5.49, keywords: ['farinha', 'trigo', 'dona benta', 'sol'] },
  { id: 'p10', name: 'Sal Refinado 1kg', category: 'mercearia', unit: 'pct', basePrice: 2.50, keywords: ['sal', 'cisne'] },

  // Hortifrúti
  { id: 'p11', name: 'Banana Prata kg', category: 'hortifruti', unit: 'kg', basePrice: 6.99, keywords: ['banana', 'prata', 'fruta'] },
  { id: 'p12', name: 'Tomate Italiano kg', category: 'hortifruti', unit: 'kg', basePrice: 8.90, keywords: ['tomate', 'italiano', 'legume'] },
  { id: 'p13', name: 'Cebola kg', category: 'hortifruti', unit: 'kg', basePrice: 5.49, keywords: ['cebola'] },
  { id: 'p14', name: 'Batata Monalisa kg', category: 'hortifruti', unit: 'kg', basePrice: 6.20, keywords: ['batata', 'monalisa'] },
  { id: 'p15', name: 'Maçã Fuji kg', category: 'hortifruti', unit: 'kg', basePrice: 9.80, keywords: ['maca', 'fuji', 'fruta'] },
  { id: 'p16', name: 'Alface Crespa un', category: 'hortifruti', unit: 'un', basePrice: 3.50, keywords: ['alface', 'crespa', 'verdura'] },
  { id: 'p17', name: 'Cenoura kg', category: 'hortifruti', unit: 'kg', basePrice: 4.90, keywords: ['cenoura'] },
  { id: 'p18', name: 'Alho Roxo 200g', category: 'hortifruti', unit: 'pct', basePrice: 7.50, keywords: ['alho', 'tempero'] },
  { id: 'p19', name: 'Limão Taiti kg', category: 'hortifruti', unit: 'kg', basePrice: 3.99, keywords: ['limao', 'taiti'] },
  { id: 'p20', name: 'Ovos Brancos Extras 30 un', category: 'hortifruti', unit: 'cx', basePrice: 19.90, keywords: ['ovo', 'ovos', 'duzia'] },

  // Carnes & Aves
  { id: 'p21', name: 'Picanha Bovina kg', category: 'carnes', unit: 'kg', basePrice: 69.90, keywords: ['picanha', 'carne', 'churrasco'] },
  { id: 'p22', name: 'Peito de Frango Desossado kg', category: 'carnes', unit: 'kg', basePrice: 18.90, keywords: ['frango', 'peito', 'filé', 'sadia', 'seara'] },
  { id: 'p23', name: 'Carne Moída Patinho kg', category: 'carnes', unit: 'kg', basePrice: 36.90, keywords: ['carne moida', 'patinho', 'bovino'] },
  { id: 'p24', name: 'Linguiça Toscana Sadia/Seara kg', category: 'carnes', unit: 'kg', basePrice: 22.50, keywords: ['linguica', 'toscana', 'churrasco'] },
  { id: 'p25', name: 'Contrafilé Bovino kg', category: 'carnes', unit: 'kg', basePrice: 48.90, keywords: ['contrafile', 'carne', 'bife'] },
  { id: 'p26', name: 'Bisteca Suína kg', category: 'carnes', unit: 'kg', basePrice: 16.90, keywords: ['suino', 'porco', 'bisteca'] },

  // Laticínios & Frios
  { id: 'p27', name: 'Leite Integral 1L', category: 'laticinios', unit: 'un', basePrice: 5.29, keywords: ['leite', 'integral', 'piracanjuba', 'parmalat', 'itambe'] },
  { id: 'p28', name: 'Queijo Mussarela Fatiado 300g', category: 'laticinios', unit: 'pct', basePrice: 14.90, keywords: ['queijo', 'mussarela', 'fatiado'] },
  { id: 'p29', name: 'Presunto Cozido Fatiado 300g', category: 'laticinios', unit: 'pct', basePrice: 11.50, keywords: ['presunto', 'sadia', 'seara'] },
  { id: 'p30', name: 'Manteiga com Sal 200g', category: 'laticinios', unit: 'un', basePrice: 10.90, keywords: ['manteiga', 'aviacao', 'elegê', 'qualita'] },
  { id: 'p31', name: 'Requeijão Cremoso 200g', category: 'laticinios', unit: 'un', basePrice: 7.80, keywords: ['requeijao', 'poços de caldas', 'danone'] },
  { id: 'p32', name: 'Iogurte Natural 170g', category: 'laticinios', unit: 'un', basePrice: 3.49, keywords: ['iogurte', 'nestle', 'danone'] },

  // Limpeza
  { id: 'p33', name: 'Detergente Líquido 500ml', category: 'limpeza', unit: 'un', basePrice: 2.79, keywords: ['detergente', 'ypê', 'limpol'] },
  { id: 'p34', name: 'Sabão em Pó Concentrado 1.6kg', category: 'limpeza', unit: 'cx', basePrice: 24.90, keywords: ['sabao em po', 'omo', 'brilhante', 'ypê'] },
  { id: 'p35', name: 'Amaciante de Roupas 2L', category: 'limpeza', unit: 'un', basePrice: 13.90, keywords: ['amaciante', 'downy', 'comfort', 'fofo'] },
  { id: 'p36', name: 'Desinfetante Multiuso 500ml', category: 'limpeza', unit: 'un', basePrice: 4.89, keywords: ['desinfetante', 'veja', 'lysoform'] },
  { id: 'p37', name: 'Papel Higiênico Folha Dupla 12 un', category: 'limpeza', unit: 'pct', basePrice: 18.90, keywords: ['papel higienico', 'neve', 'personal', 'sublime'] },
  { id: 'p38', name: 'Água Sanitária 2L', category: 'limpeza', unit: 'un', basePrice: 5.50, keywords: ['agua sanitaria', 'qboa', 'ypro'] },

  // Bebidas
  { id: 'p39', name: 'Refrigerante Coca-Cola 2L', category: 'bebidas', unit: 'un', basePrice: 9.99, keywords: ['coca cola', 'coca', 'refri'] },
  { id: 'p40', name: 'Cerveja Pilsen Lata 350ml', category: 'bebidas', unit: 'un', basePrice: 3.79, keywords: ['cerveja', 'brahma', 'skol', 'heineken', 'amstel'] },
  { id: 'p41', name: 'Suco de Laranja Integral 1L', category: 'bebidas', unit: 'un', basePrice: 11.90, keywords: ['suco', 'laranja', 'prats', 'natural one'] },
  { id: 'p42', name: 'Água Mineral sem Gás 1.5L', category: 'bebidas', unit: 'un', basePrice: 2.50, keywords: ['agua', 'bonafont', 'minalba', 'crystal'] },

  // Padaria
  { id: 'p43', name: 'Pão Francês kg', category: 'padaria', unit: 'kg', basePrice: 15.90, keywords: ['pao', 'pao frances', 'padaria'] },
  { id: 'p44', name: 'Pão de Forma Tradicional 480g', category: 'padaria', unit: 'pct', basePrice: 7.99, keywords: ['pao de forma', 'visconti', 'wickbold', 'pullman'] },
  { id: 'p45', name: 'Bolo de Fubá com Goiabada 400g', category: 'padaria', unit: 'un', basePrice: 12.50, keywords: ['bolo', 'fuba', 'goiabada'] },

  // Higiene
  { id: 'p46', name: 'Creme Dental 90g', category: 'higiene', unit: 'un', basePrice: 4.50, keywords: ['pasta de dente', 'creme dental', 'colgate', 'sorriso'] },
  { id: 'p47', name: 'Shampoo 400ml', category: 'higiene', unit: 'un', basePrice: 16.90, keywords: ['shampoo', 'pantene', 'sedal', 'dove'] },
  { id: 'p48', name: 'Sabonete em Barra 84g', category: 'higiene', unit: 'un', basePrice: 2.89, keywords: ['sabonete', 'rexona', 'dove', 'lux', 'francis'] },
  { id: 'p49', name: 'Desodorante Aerossol 150ml', category: 'higiene', unit: 'un', basePrice: 15.90, keywords: ['desodorante', 'rexona', 'nivea', 'dove'] }
];

/**
 * Simula consulta à API on-line de cotações com flutuação realista de preços por mercado
 */
class OnlinePriceService {
  /**
   * Obtém os preços de um produto específico em todas as redes de supermercado
   */
  static async getProductPrices(productName, basePrice = null, category = 'mercearia') {
    // Simula delay de rede (300-700ms)
    await new Promise(res => setTimeout(res, 200 + Math.random() * 300));

    // Procura no catálogo ou cria cotação para produto customizado
    const match = PRODUCT_CATALOG.find(p => p.name.toLowerCase() === productName.toLowerCase());
    const finalBasePrice = basePrice || (match ? match.basePrice : 12.50);

    // Flutuação aleatória de mercado recente (-5% a +6%)
    const randomVariation = (Math.random() * 0.11) - 0.05;
    const updatedBase = Math.max(1.00, +(finalBasePrice * (1 + randomVariation)).toFixed(2));

    // Determinar tendência
    let trend = 'neutral';
    if (updatedBase > finalBasePrice) trend = 'up';
    else if (updatedBase < finalBasePrice) trend = 'down';

    // Gerar cotações para cada supermercado
    const storePrices = SUPERMARKETS.map(market => {
      // Variação por supermercado com base no fator e pequenas flutuações pontuais
      const storeVar = (Math.random() * 0.06) - 0.03;
      const price = +(updatedBase * market.factor * (1 + storeVar)).toFixed(2);
      return {
        marketId: market.id,
        marketName: market.name,
        price: Math.max(0.50, price)
      };
    });

    const lowestStore = storePrices.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), storePrices[0]);

    return {
      productName,
      updatedBasePrice: updatedBase,
      trend,
      trendPercent: +(Math.abs(randomVariation) * 100).toFixed(1),
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      storePrices,
      bestStore: lowestStore.marketName,
      bestPrice: lowestStore.price
    };
  }

  /**
   * Sincroniza uma lista inteira com os preços on-line atualizados
   */
  static async syncListPrices(items) {
    const updatedItems = [];
    for (const item of items) {
      const result = await this.getProductPrices(item.name, item.price, item.category);
      updatedItems.push({
        ...item,
        price: result.updatedBasePrice,
        trend: result.trend,
        trendPercent: result.trendPercent,
        lastUpdated: result.lastUpdated,
        storePrices: result.storePrices
      });
    }
    return updatedItems;
  }

  /**
   * Calcula o custo da lista em cada supermercado e retorna o ranking
   */
  static calculateStoreTotals(items) {
    return SUPERMARKETS.map(market => {
      let total = 0;
      items.forEach(item => {
        const qty = item.quantity || 1;
        if (item.storePrices) {
          const storeEntry = item.storePrices.find(sp => sp.marketId === market.id);
          const price = storeEntry ? storeEntry.price : item.price * market.factor;
          total += price * qty;
        } else {
          total += (item.price * market.factor) * qty;
        }
      });

      return {
        ...market,
        total: +total.toFixed(2)
      };
    }).sort((a, b) => a.total - b.total);
  }
}

// Export global para uso direto em scripts cliente
window.SUPERMARKETS = SUPERMARKETS;
window.CATEGORIES = CATEGORIES;
window.PRODUCT_CATALOG = PRODUCT_CATALOG;
window.OnlinePriceService = OnlinePriceService;
