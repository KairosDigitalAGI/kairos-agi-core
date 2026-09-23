// Executor agendável do Commercial Runtime. Não cria atividade externa sem um
// conector configurado: cada canal retorna estado operacional verificável.
import { timingSafeEqual } from 'node:crypto'

const channels = [
  { id: 'freelancer', token: 'FREELANCER_API_ACCESS_TOKEN', endpoint: 'FREELANCER_API_PROJECTS_URL' },
  { id: 'whatsapp', token: 'KAIROS_WHATSAPP_GATEWAY_URL', endpoint: 'KAIROS_WHATSAPP_GATEWAY_TOKEN' },
  { id: 'instagram', token: 'META_APP_ID', endpoint: 'META_APP_SECRET' },
]
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
export function runnerStatus(env=process.env){return channels.map(channel=>({channel:channel.id,state:env[channel.token]&&env[channel.endpoint]?'ready':'paused_auth',reason:env[channel.token]&&env[channel.endpoint]?undefined:'Integração ainda não autorizada no servidor.'}))}
export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({erro:'Use GET.'})
 if(!process.env.CRON_SECRET||!equal(req.headers.authorization,`Bearer ${process.env.CRON_SECRET}`)) return res.status(401).end()
 const runs=runnerStatus(); return res.status(200).json({checkedAt:new Date().toISOString(),runs})
}
