import { readCommand, writeCommand } from './_command.js'
export async function listCommercialRuns(){ const rows=await readCommand('commercial_runs','?select=*&order=updated_at.desc&limit=100'); return rows??null }
export async function createCommercialRun(input){ if(!input?.channel||!input?.step) throw new Error('channel e step são obrigatórios.'); const [row]=await writeCommand('commercial_runs',{channel:input.channel,step:input.step,state:'ready',source_url:input.sourceUrl??null,opportunity_id:input.opportunityId??null,proposal_text:input.proposalText??null}); return row }
