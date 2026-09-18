// Página de Política de Privacidade — requisito obrigatório para Meta App Review.
// Retorna HTML estático em PT-BR. Acessível publicamente sem autenticação.
export const config = { api: { bodyParser: false } }

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Política de Privacidade — Kairos Digital</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0e13; color: #d4cfdf; max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; line-height: 1.65 }
    h1 { font-size: 1.7rem; color: #fff; margin-bottom: 6px }
    .sub { color: #81798b; font-size: .82rem; margin-bottom: 40px }
    h2 { font-size: 1rem; color: #c4b5fd; margin: 32px 0 10px; letter-spacing: .02em }
    p, li { font-size: .88rem; color: #b5afc4 }
    ul { padding-left: 20px; margin-top: 8px }
    li { margin-bottom: 6px }
    a { color: #93c5fd }
    footer { margin-top: 56px; border-top: 1px solid rgba(255,255,255,.08); padding-top: 20px; color: #81798b; font-size: .75rem }
  </style>
</head>
<body>
  <h1>Política de Privacidade</h1>
  <p class="sub">Kairos Digital &mdash; Última atualização: setembro de 2026</p>

  <h2>1. Quem somos</h2>
  <p>A <strong>Kairos Digital</strong> é uma empresa brasileira que oferece soluções de automação com inteligência artificial para pequenas e médias empresas. Nosso painel (<em>Kairos AGI Core</em>) permite que empresas conectem suas contas do Instagram e YouTube para publicar conteúdo e automatizar respostas a comentários e mensagens diretas.</p>

  <h2>2. Quais dados coletamos</h2>
  <ul>
    <li><strong>Tokens de acesso OAuth</strong> do Instagram e YouTube, armazenados de forma criptografada no servidor. Nunca são expostos ao navegador.</li>
    <li><strong>Identificadores públicos</strong> da conta conectada (nome de usuário, ID da conta).</li>
    <li><strong>Conteúdo de comentários e mensagens diretas</strong> recebidos via webhook do Instagram, usados exclusivamente para gerar respostas automáticas via IA. Não são compartilhados com terceiros.</li>
    <li><strong>Logs de respostas automáticas</strong>: texto recebido, texto enviado e eventuais erros. Retidos por no máximo 90 dias.</li>
  </ul>

  <h2>3. Como usamos os dados</h2>
  <ul>
    <li>Publicar conteúdo (Reels) em nome da conta do Instagram conectada, mediante aprovação explícita do titular.</li>
    <li>Responder automaticamente a comentários e DMs do Instagram quando a automação estiver habilitada pelo titular da conta.</li>
    <li>Nenhum dado é vendido, alugado ou compartilhado com terceiros para fins de marketing.</li>
  </ul>

  <h2>4. Permissões do Instagram solicitadas</h2>
  <ul>
    <li><code>instagram_business_basic</code> — leitura do perfil profissional</li>
    <li><code>instagram_business_content_publish</code> — publicação de Reels</li>
    <li><code>instagram_business_manage_comments</code> — leitura e resposta a comentários</li>
    <li><code>instagram_business_manage_messages</code> — envio de respostas a mensagens diretas</li>
  </ul>
  <p>Essas permissões são usadas exclusivamente para as funcionalidades descritas acima. O acesso é revogável a qualquer momento pelo titular da conta.</p>

  <h2>5. Retenção e exclusão de dados</h2>
  <p>Os tokens OAuth são excluídos imediatamente ao desconectar a conta pelo painel. Logs de automação são retidos por até 90 dias e depois excluídos automaticamente. O titular pode solicitar exclusão antecipada pelo e-mail abaixo.</p>

  <h2>6. Segurança</h2>
  <p>Todos os tokens são criptografados em repouso usando AES-256-GCM com chave de servidor. O painel de controle exige autenticação Basic Auth. Comunicações entre o servidor e as APIs do Meta e Google são realizadas via HTTPS.</p>

  <h2>7. Contato</h2>
  <p>Para dúvidas, solicitações de exclusão ou exercício de direitos previstos na LGPD:<br />
  <a href="mailto:contato@kairosdigital.com.br">contato@kairosdigital.com.br</a></p>

  <footer>
    &copy; 2026 Kairos Digital. Esta política se aplica ao aplicativo <em>Kairos AGI Core</em> integrado à plataforma Meta (Instagram).
  </footer>
</body>
</html>`

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(HTML)
}
