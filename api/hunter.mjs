import { checkAuth, unauthorized } from './_auth.js'
import { discoverFreelancerProjects } from './_freelancerDiscovery.js'
import { createCommercialRun, listCommercialRuns } from './_commercial.js'
import { acknowledgeDevUpdates, addDevRequest, checkCrmSyncAuth, confirmDevRequest, listCrm, listPendingDevUpdates, syncCrmLeads, updateDevRequest } from './_crm.js'

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 const action=req.query?.action
 try{
  if((req.method==='POST'&&['crm-sync','dev-request','dev-confirm','dev-ack'].includes(action))||(req.method==='GET'&&action==='dev-updates')){
   if(!checkCrmSyncAuth(req)) return unauthorized(res)
   if(action==='crm-sync') return res.status(200).json(await syncCrmLeads(req.body))
   if(action==='dev-request') return res.status(201).json({request:await addDevRequest(req.body)})
   if(action==='dev-confirm') return res.status(200).json({request:await confirmDevRequest(req.body)})
   if(action==='dev-updates') return res.status(200).json({events:await listPendingDevUpdates()})
   return res.status(200).json(await acknowledgeDevUpdates(req.body))
  }
  if(!checkAuth(req)) return unauthorized(res)
  if(req.method==='GET'&&action==='crm') return res.status(200).json(await listCrm())
  if(req.method==='POST'&&action==='dev-update') return res.status(200).json({request:await updateDevRequest(req.body)})
  if(req.method==='GET'&&action==='runs'){const runs=await listCommercialRuns();return runs?res.status(200).json({source:'real',runs}):res.status(503).json({source:'unavailable',reason:'Supabase não configurado.'})}
  if(req.method==='POST'&&action==='run') return res.status(201).json(await createCommercialRun(req.body))
  if(req.method==='POST'&&(!action||action==='discover')) return res.status(200).json(await discoverFreelancerProjects({query:req.body?.query,limit:req.body?.limit}))
  return res.status(405).json({erro:'Ação ou método não permitido.'})
 }catch(error){return res.status(error.status||503).json({erro:error.message})}
}
