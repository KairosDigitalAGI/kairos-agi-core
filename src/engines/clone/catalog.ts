import type { LibraryKind, SocialChannel } from '../../types/clone'
export const socialChannels: SocialChannel[] = ['Instagram', 'TikTok', 'YouTube Shorts', 'Threads', 'LinkedIn', 'X', 'Pinterest', 'Facebook Reels']
export const providerIds = ['manual', 'google-flow', 'higgsfield', 'kling', 'runway', 'pika'] as const
export interface CatalogField { key: string; label: string; required?: boolean; options?: string[] }
export const libraryCatalog: Record<LibraryKind, { label: string; description: string; fields: CatalogField[] }> = {
  identity: { label: 'Identity Manager', description: 'Cadastre a identidade do Founder e o escopo de uso autorizado.', fields: [
    { key: 'owner', label: 'Titular', required: true }, { key: 'context', label: 'Identidade, estilo e limites', required: true },
    { key: 'consent', label: 'Autorização de uso', required: true, options: ['Pendente', 'Autorizado', 'Revogado'] },
    { key: 'evidence', label: 'Referência da autorização e escopo permitido', required: true },
  ] },
  voice: { label: 'Voice Profile', description: 'Referências de voz autorizada. Nenhuma voz é treinada ou sintetizada nesta missão.', fields: [
    { key: 'owner', label: 'Titular', required: true }, { key: 'reference', label: 'Referência local da amostra real', required: true },
    { key: 'style', label: 'Idioma, tom e características', required: true }, { key: 'rights', label: 'Autorização e limites de uso', required: true },
  ] },
  face: { label: 'Face Profile', description: 'Referências de rosto, sem envio de fotos ou processamento biométrico.', fields: [
    { key: 'owner', label: 'Titular', required: true }, { key: 'reference', label: 'Referência local das fotos reais', required: true },
    { key: 'rights', label: 'Autorização e limites de uso', required: true },
  ] },
  avatar: { label: 'Avatar Library', description: 'Catalogue avatares existentes e sua origem.', fields: [
    { key: 'reference', label: 'Referência do avatar', required: true }, { key: 'style', label: 'Estilo e uso pretendido' },
    { key: 'rights', label: 'Titularidade ou licença', required: true },
  ] },
  prompt: { label: 'Prompt Library', description: 'Prompts versionados do Clone. Nenhum modelo é chamado.', fields: [
    { key: 'objective', label: 'Objetivo', required: true }, { key: 'input', label: 'Entrada esperada', required: true },
    { key: 'output', label: 'Saída esperada', required: true }, { key: 'engine', label: 'Engine', required: true, options: [...providerIds] },
    { key: 'category', label: 'Categoria', required: true }, { key: 'body', label: 'Texto do prompt', required: true },
  ] },
  asset: { label: 'Asset Library', description: 'Catálogo de referências a arquivos reais. Não copia, envia ou hospeda os arquivos.', fields: [
    { key: 'type', label: 'Tipo', required: true, options: ['Logo', 'Cor', 'Fonte', 'Avatar', 'Música', 'Vídeo', 'B-Roll', 'Voz', 'Imagem', 'Thumbnail'] },
    { key: 'reference', label: 'Caminho ou referência do ativo (sem tokens)', required: true },
    { key: 'rights', label: 'Titularidade, licença e origem', required: true },
  ] },
  brain: { label: 'Content Brain', description: 'Conhecimento de conteúdo cadastrado por você, reutilizável entre Engines.', fields: [
    { key: 'category', label: 'Categoria', required: true, options: ['Categoria', 'Gatilho', 'Hook', 'Roteiro', 'CTA', 'Objeção', 'Nicho', 'Produto'] },
    { key: 'body', label: 'Conteúdo', required: true }, { key: 'source', label: 'Origem verificável', required: true },
  ] },
}
