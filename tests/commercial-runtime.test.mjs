import test from 'node:test'
import assert from 'node:assert/strict'
import { beginRun, pauseForAuth, recordRemoteSend } from '../src/engines/commercial/runtime.ts'

const base={id:'run_1',channel:'freelancer',step:'send',state:'ready',updatedAt:'2026-09-23T00:00:00.000Z'}
test('commercial runtime pauses a channel when auth expires without claiming a send',()=>{const running=beginRun(base,'2026-09-23T01:00:00.000Z');const paused=pauseForAuth(running,'OAuth expirado','2026-09-23T01:01:00.000Z');assert.equal(paused.state,'paused_auth');assert.equal(paused.remoteId,undefined)})
test('commercial runtime only completes a send after remote confirmation',()=>{const running=beginRun(base,'2026-09-23T01:00:00.000Z');const sent=recordRemoteSend(running,'remote_91','2026-09-23T01:01:00.000Z');assert.equal(sent.state,'completed');assert.equal(sent.remoteId,'remote_91');assert.throws(()=>recordRemoteSend(running,'','2026-09-23T01:01:00.000Z'))})
