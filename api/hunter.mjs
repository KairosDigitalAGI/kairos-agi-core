import { checkAuth, unauthorized } from './_auth.js'
import { discoverFreelancerProjects } from './_freelancerDiscovery.js'
import { createCommercialRun, listCommercialRuns } from './_commercial.js'

export default async function handler(req,res){
 if(!checkAuth(req)) return unauthorized(res)
 res.setHeader('Cache-Control','no-store')
 const action=req.query?.action
 try{
  if(req.method==='GET'&&action==='runs'){const runs=await listCommercialRuns();return runs?res.status(200).json({source:'real',runs}):res.status(503).json({source:'unavailable',reason:'Supabase não configurado.'})}
  if(req.method==='POST'&&action==='run') return res.status(201).json(await createCommercialRun(req.body))
  if(req.method==='POST'&&(!action||action==='discover')) return res.status(200).json(await discoverFreelancerProjects({query:req.body?.query,limit:req.body?.limit}))
  return res.status(405).json({erro:'Ação ou método não permitido.'})
 }catch(error){return res.status(error.status||503).json({erro:error.message})}
}
