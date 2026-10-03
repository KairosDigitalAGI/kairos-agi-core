export type MarketplaceReadiness = 'recomendado' | 'viavel' | 'condicional' | 'indisponivel'

export type MarketplaceOption = {
  id: 'mercado-livre' | 'shopee' | 'tiktok-shop' | 'aliexpress'
  name: string
  model: string
  stock: string
  capital: string
  readiness: MarketplaceReadiness
  score: number | null
  evidence: string
  sourceUrl: string | null
  constraint: string
}

export const marketplaceOptions: MarketplaceOption[] = [
  { id: 'mercado-livre', name: 'Mercado Livre', model: 'Afiliado com curadoria e conteúdo', stock: 'Não exige estoque próprio', capital: 'R$ 0 para iniciar o piloto', readiness: 'recomendado', score: 92, evidence: 'Programa oficial aceita maiores de 18 anos, paga até 16% em produtos elegíveis e liquida a partir de R$ 30 após validação.', sourceUrl: 'https://www.mercadolivre.com.br/l/afiliados-home', constraint: 'Cadastro, aprovação e canais declarados continuam obrigatórios; venda só conta após validação da plataforma.' },
  { id: 'shopee', name: 'Shopee', model: 'Afiliado com links, vídeo e live', stock: 'Não exige produto próprio', capital: 'R$ 0 para iniciar o piloto', readiness: 'viavel', score: 82, evidence: 'Programa oficial atribui comissão por compra concluída e oferece cookie de sete dias.', sourceUrl: 'https://help.shopee.com.br/portal/10/article/124098-O-que-%C3%A9-o-Programa-de-Afiliados-da-Shopee?seo=1', constraint: 'Exige aprovação, CPF/CNPJ regular, identificação trabalhista e conta de pagamento compatível para receber.' },
  { id: 'tiktok-shop', name: 'TikTok Shop', model: 'Criador afiliado com vídeos e links', stock: 'Produtos de vendedores parceiros', capital: 'R$ 0 em mídia; exige produção de conteúdo', readiness: 'condicional', score: 76, evidence: 'Programa de afiliados está disponível no Brasil; contas abaixo de 2.000 seguidores entram em piloto de 30 dias.', sourceUrl: 'https://seller-br.tiktok.com/university/essay?knowledge_id=2918995033900817&lang=pt-BR', constraint: 'Exige elegibilidade, verificação de identidade e conteúdo conforme as políticas; publicação depende de aprovação humana.' },
  { id: 'aliexpress', name: 'AliExpress', model: 'A definir após validação oficial no Brasil', stock: 'Indisponível', capital: 'Indisponível', readiness: 'indisponivel', score: null, evidence: 'Não foi localizada fonte oficial pública suficiente para validar a operação brasileira sem estoque nesta revisão.', sourceUrl: null, constraint: 'Não entra no piloto até regras, elegibilidade, pagamento e suporte local serem confirmados em fonte oficial.' },
]

export const ecommerceRoles = [
  { role: 'Líder de canal', duty: 'Define tese, público e metas; libera cada ação externa.', owner: 'ORION' },
  { role: 'Pesquisa de catálogo', duty: 'Filtra produtos elegíveis, reputação, demanda e políticas.', owner: 'Money Hunter' },
  { role: 'Economia unitária', duty: 'Registra comissão, cancelamentos, impostos e receita validada.', owner: 'Money Lab' },
  { role: 'Conteúdo e oferta', duty: 'Produz briefing, roteiro, criativo e declaração publicitária.', owner: 'Instagram AI' },
  { role: 'Conformidade', duty: 'Valida fonte, direitos, política do canal e identidade.', owner: 'Shield AI + QA AI' },
  { role: 'Operação e suporte', duty: 'Acompanha links, dúvidas, conversões e exceções documentadas.', owner: 'KAIROS' },
] as const

export const pilotGates = [
  { id: 'account', label: 'Conta oficial aprovada', state: 'human' },
  { id: 'profile', label: 'Perfil, pagamento e dados fiscais validados', state: 'human' },
  { id: 'catalog', label: 'Primeira cesta de produtos elegíveis', state: 'planned' },
  { id: 'creative', label: 'Pacote de conteúdo revisado', state: 'planned' },
  { id: 'publish', label: 'Publicação autorizada pelo Founder', state: 'blocked' },
  { id: 'metrics', label: 'Receita importada da fonte oficial', state: 'blocked' },
] as const

export function selectRecommendedMarketplace(options: MarketplaceOption[] = marketplaceOptions) {
  return options.filter((option): option is MarketplaceOption & { score: number } => option.score !== null).sort((a, b) => b.score - a.score)[0] ?? null
}
