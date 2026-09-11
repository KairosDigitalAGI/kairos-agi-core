export type VideoAspect = 'original' | '9:16' | '1:1' | '16:9'
export type VideoQuality = 'economy' | 'balanced' | 'high'

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
}

export interface VideoRenderResult {
  blob: Blob
  mimeType: string
  durationSeconds: number
  width: number
  height: number
}
