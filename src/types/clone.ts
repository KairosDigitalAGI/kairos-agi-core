export type Edition = 'founder' | 'client'
export type LibraryKind = 'identity' | 'voice' | 'face' | 'avatar' | 'prompt' | 'asset' | 'brain'
export interface LibraryRecord {
  id: string
  kind: LibraryKind
  name: string
  fields: Record<string, string>
  revision: number
  updatedAt: string
}
export type CloneStage = 'Ideia' | 'Roteiro' | 'Prompt' | 'Imagem' | 'Vídeo' | 'Legenda' | 'Thumbnail' | 'Aprovação Founder' | 'Publicação'
export type SocialChannel = 'Instagram' | 'TikTok' | 'YouTube Shorts' | 'Threads' | 'LinkedIn' | 'X' | 'Pinterest' | 'Facebook Reels'
export interface CloneDraft {
  title: string
  identityId: string
  promptId: string
  provider: string
  channels: SocialChannel[]
  script: string
  imageAssetId: string
  videoAssetId: string
  caption: string
  thumbnailAssetId: string
}
export interface CloneVideo extends CloneDraft {
  id: string
  revision: number
  stage: CloneStage
  approvedRevision: number | null
  approvedLibraryRevision: number | null
  feedback: string
  history: { at: string; action: string }[]
}
export interface CloneState {
  version: 1
  edition: 'founder'
  libraryRevision: number
  records: LibraryRecord[]
  videos: CloneVideo[]
}
