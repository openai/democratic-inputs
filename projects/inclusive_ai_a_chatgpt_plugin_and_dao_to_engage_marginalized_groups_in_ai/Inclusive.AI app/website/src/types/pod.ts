import { SnapshotSupportedTypes } from '@/types'

export type ValueQuestion = {
  id: number
  topic: string
  question: string
  note: string | null
  createdAt: string
  // pod: UserPod
  isActive: boolean
  // Snapshots
  snapshotId: string | null
  snapshotType: SnapshotSupportedTypes
  snapshotSpace: string | null
  snapshotStartDate: number | null
  snapshotEndDate: number | null
  snapshotChoices: string[] | null
}
