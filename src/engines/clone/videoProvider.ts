import type { Edition } from '../../types/clone'
import { providerIds } from './catalog.ts'
export interface VideoRequest { edition: Edition; tenantId: string; videoId: string; revision: number; prompt: string; idempotencyKey: string; budgetCents: number }
export interface VideoResult { jobId: string; status: 'queued' | 'running' | 'completed' | 'failed'; assetId?: string; costCents: number | null }
export interface VideoProvider { id: string; connected: boolean; generate(request: VideoRequest): Promise<VideoResult> }
export const videoProviders: VideoProvider[] = providerIds.map(id => ({ id, connected: false, async generate() { throw new Error('Provedor desconectado. Nenhuma geração, cobrança ou publicação foi executada.') } }))
