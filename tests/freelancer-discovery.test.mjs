import test from 'node:test'
import assert from 'node:assert/strict'
import { discoverFreelancerProjects, freelancerDiscoveryConfigured, normalizeFreelancerProject } from '../api/_freelancerDiscovery.js'

test('Freelancer discovery fails closed without server configuration', async () => {
  assert.equal(freelancerDiscoveryConfigured({}), false)
  await assert.rejects(() => discoverFreelancerProjects({ query: 'wordpress', env: {} }), { message: /FREELANCER_API_ACCESS_TOKEN/ })
})

test('Freelancer discovery only returns complete projects supplied by the official response', async () => {
  const output = await discoverFreelancerProjects({
    query: 'wordpress',
    env: { FREELANCER_API_ACCESS_TOKEN: 'test-token', FREELANCER_API_PROJECTS_URL: 'https://api.example.test/projects' },
    fetchImpl: async (url, options) => {
      assert.equal(url.searchParams.get('query'), 'wordpress')
      assert.equal(options.headers.Authorization, 'Bearer test-token')
      return new Response(JSON.stringify({ projects: [
        { id: 42, title: 'Site WordPress', description: 'Criar um site institucional', url: 'https://source.example/42', budget: 'R$ 1.500' },
        { id: 43, title: 'Incompleto' },
      ] }), { status: 200 })
    },
  })
  assert.equal(output.projects.length, 1)
  assert.deepEqual(output.projects[0], { sourceId: '42', title: 'Site WordPress', summary: 'Criar um site institucional', url: 'https://source.example/42', budget: 'R$ 1.500' })
  assert.equal(normalizeFreelancerProject({ id: 1, title: 'x', description: '' }), null)
})
