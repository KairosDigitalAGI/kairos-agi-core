import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const registry = JSON.parse(fs.readFileSync(new URL('../src/data/agentRegistry.json', import.meta.url)))
const meetings = JSON.parse(fs.readFileSync(new URL('../src/data/meetingTemplates.json', import.meta.url)))
test('all fifteen legacy roles retained once with explicit source mapping', () => {
  const legacy = registry.filter(a => a.source === 'Kairos OS')
  assert.equal(legacy.length, 15)
  assert.deepEqual(legacy.map(a => a.sourceId).sort(), ['ceo','cfo','cpo','hunter','whatsapp','analytics','cmo','crm','cro','cto','products','site-maker','ads','social','youtube'].sort())
  assert.equal(legacy.find(a => a.sourceId === 'ceo').id, 'orion')
  assert.equal(legacy.find(a => a.sourceId === 'whatsapp').name, 'KAIROS')
  assert.equal(new Set(registry.map(a => a.id)).size, registry.length)
  assert.equal(registry.some(a => /arthur/i.test(a.name)), false)
})
test('reporting lines have valid parents and no cycles; all meeting participants resolve', () => {
  for (const agent of registry) {
    let id = agent.id
    const visited = new Set()
    while(id !== 'Founder') {
      assert.equal(visited.has(id), false)
      visited.add(id)
      const record = registry.find(a => a.id === id)
      assert.ok(record)
      id = record.reportsTo
    }
  }
  for (const meeting of meetings) for (const id of meeting.participants) assert.ok(registry.some(a => a.id === id))
})
