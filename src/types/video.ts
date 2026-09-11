export type VideoAspect = 'original' | '9:16' | '1:1' | '16:9'
export type VideoQuality = 'economy' | 'balanced' | 'high'
export type VideoGenerationStyle = 'kairos' | 'minimal' | 'energy'

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
