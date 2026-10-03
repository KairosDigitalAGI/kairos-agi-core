import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/features/moneylab/ecommercePilot.ts', import.meta.url), 'utf8')

test('e-commerce pilot compares all four requested marketplaces', () => {
  for (const channel of ['mercado-livre', 'shopee', 'tiktok-shop', 'aliexpress']) assert.match(source, new RegExp(`id: '${channel}'`))
})

test('pilot does not convert unknown external data into zero', () => {
  assert.match(source, /score: null/)
  assert.match(source, /Indisponível/)
  assert.doesNotMatch(source, /score: 0/)
})

test('pilot keeps publication behind Founder authorization', () => {
  assert.match(source, /Publicação autorizada pelo Founder/)
})
