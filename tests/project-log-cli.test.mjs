import assert from 'node:assert/strict'
import test from 'node:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readOutbox } from '../scripts/project-log-outbox.mjs'

test('project log CLI queues locally without credentials', () => {
  const directory = mkdtempSync(join(tmpdir(), 'kairos-project-log-cli-'))
  const file = join(directory, 'outbox.jsonl')
  try {
    const run = spawnSync(process.execPath, [
      'scripts/log-update.mjs', '--queue-only', '--agent=codex', '--phase=Missão 043',
      '--type=done', '--title=Outbox local', '--commit=abc1234',
    ], { cwd: join(import.meta.dirname, '..'), env: { ...process.env, PROJECT_LOG_OUTBOX_PATH: file }, encoding: 'utf8' })
    assert.equal(run.status, 0, run.stderr)
    assert.match(run.stdout, /fila local/)
    assert.equal(readOutbox(file)[0].entry.commit, 'abc1234')
  } finally {
    for (const name of readdirSync(directory)) unlinkSync(join(directory, name))
    rmdirSync(directory)
  }
})
