export type VideoAspect = 'original' | '9:16' | '1:1' | '16:9'
export type VideoQuality = 'economy' | 'balanced' | 'high'
export type VideoGenerationStyle = 'kairos' | 'minimal' | 'energy'
export type VideoProviderKind = 'local' | 'runway'
export type VideoCostUnit = 'second' | 'image'
export type DistributionChannel = 'instagram' | 'youtube' | 'tiktok' | 'x'

export interface GenerativeModel {
  id: string
  provider: VideoProviderKind
  label: string
  media: 'video' | 'image'
  capability: string
  usdPerUnit: number
  unit: VideoCostUnit
  connected: boolean
  sourceUrl: string
  verifiedAt: string
}

export interface CampaignBrief {
  product: string
  audience: string
  promise: string
  proof: string
  callToAction: string
  durationSeconds: number
  videoModelId: string
  imageModelId: string
  imageCount: number
}

export interface CampaignEstimate {
  videoUsd: number
  imagesUsd: number
  totalUsd: number
  status: 'free' | 'estimate' | 'unavailable'
}

export interface DistributionConnection {
  channel: DistributionChannel
  label: string
  connected: boolean
  publishCostUsd: number
  requirement: string
  sourceUrl: string
}

export interface FreeTierProvider {
  id: string
  label: string
  connected: boolean
  access: 'local' | 'manual-web'
  allowance: string
  eightSecondCapacity: string
  renewal: string
  watermark: string
  sourceUrl: string
}

export interface VideoRenderPlan {
  title: string
  startSeconds: number
  endSeconds: number
  aspect: VideoAspect
  quality: VideoQuality
  watermark: string
  includeAudio: boolean
  musicVolume: number
}

export interface VideoJob {
  id: string
  sourceName: string
  outputName: string
  createdAt: string
  finishedAt: string | null
  status: 'rendering' | 'completed' | 'failed' | 'cancelled'
  progress: number
  inputBytes: number
  outputBytes: number | null
  durationSeconds: number
  mimeType: string | null
  error: string
  kind?: 'generated' | 'edited'
}

export interface VideoGenerationPlan {
  title: string
  script: string
  aspect: Exclude<VideoAspect, 'original'>
  quality: VideoQuality
  style: VideoGenerationStyle
  secondsPerScene: number
  watermark: string
  soundtrack: boolean
}

export interface VideoScene {
  id: string
  headline: string
  kicker: string
  durationSeconds: number
  accent: string
  secondary: string
  motion: 'orbit' | 'rise' | 'pulse'
}

export interface VideoRenderResult {
  blob: Blob
  mimeType: string
  durationSeconds: number
  width: number
  height: number
}

export interface StoredVideo {
  id: string
  name: string
  createdAt: string
  durationSeconds: number
  width: number
  height: number
  mimeType: string
  bytes: number
  kind: 'generated' | 'edited'
  blob: Blob
}
