import test from 'node:test'
import assert from 'node:assert/strict'
import { runnerStatus } from '../api/commercial-runner.mjs'
test('runner isolates channels without configured credentials',()=>{const states=runnerStatus({FREELANCER_API_ACCESS_TOKEN:'x',FREELANCER_API_PROJECTS_URL:'https://api.example'});assert.equal(states.find(x=>x.channel==='freelancer').state,'ready');assert.equal(states.find(x=>x.channel==='instagram').state,'paused_auth')})
