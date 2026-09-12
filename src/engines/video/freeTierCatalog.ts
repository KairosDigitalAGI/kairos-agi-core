import type { FreeTierProvider } from '../../types/video'

export const freeTierProviders: FreeTierProvider[] = [
  { id: 'browser-local', label: 'Kairos Motion local', connected: true, access: 'local', allowance: 'Sem créditos de API', eightSecondCapacity: 'Sem limite de provedor', renewal: 'Não se aplica', watermark: 'Marca definida pelo Founder', sourceUrl: '' },
  { id: 'google-flow-free', label: 'Google Flow · Veo 3.1 Lite', connected: false, access: 'manual-web', allowance: '50 créditos gratuitos por dia', eightSecondCapacity: 'Até 5 clipes por dia', renewal: 'Renovação diária após a primeira geração', watermark: 'Conforme o plano e o produto Google', sourceUrl: 'https://support.google.com/flow/answer/16526234' },
  { id: 'runway-free', label: 'Runway Free', connected: false, access: 'manual-web', allowance: '125 créditos, uma única vez', eightSecondCapacity: 'Depende dos modelos liberados na conta', renewal: 'Não renova', watermark: 'Obrigatória no plano gratuito', sourceUrl: 'https://help.runwayml.com/hc/en-us/articles/50404627334547-Free-plan-details' },
  { id: 'higgsfield-free', label: 'Higgsfield Free', connected: false, access: 'manual-web', allowance: 'Modelos e créditos exibidos na conta', eightSecondCapacity: 'Indisponível sem consultar o saldo real', renewal: 'Conforme a oferta vigente', watermark: 'Conforme o modelo selecionado', sourceUrl: 'https://higgsfield.ai/creator-hub/help-center/plans/how-do-higgsfield-plans-work' },
]
