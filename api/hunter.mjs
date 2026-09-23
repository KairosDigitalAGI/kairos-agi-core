import { checkAuth, unauthorized } from './_auth.js'
import { discoverFreelancerProjects } from './_freelancerDiscovery.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST.' })
  res.setHeader('Cache-Control', 'no-store')

  try {
    const result = await discoverFreelancerProjects({ query: req.body?.query, limit: req.body?.limit })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(error.status || 500).json({ erro: error.message })
  }
}
