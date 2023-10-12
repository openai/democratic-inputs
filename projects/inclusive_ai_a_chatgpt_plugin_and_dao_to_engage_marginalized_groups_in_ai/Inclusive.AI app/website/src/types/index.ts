export * from './chat'
export * from './pod'
export * from './profile'
export * from './snapshot'
export * from './user'

export type ChatDialogue = {
  // id: number
  role: 'user' | 'system' | 'assistant'
  content: string
  createdAt: number
  replyTo?: number
  tag?: string
}
