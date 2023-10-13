import { create } from "zustand"

export type ActiveGuideline = {
  value: string
  guidelineId?: string
}

type State = {
  // topicId is the id of the topic that is currently selected
  topicId: string | null
  setTopicId: (topicId: string | null) => void

  // activeGuideline is the guideline that is currently selected
  activeGuideline: ActiveGuideline | null
  setActiveGuideline: (activeGuideline: ActiveGuideline | null) => void

  // activeType is the type of the guideline that is currently selected (none, needs help, propose)
  activeType: 0 | 1 | 2
  setActiveType: (activeType: 0 | 1 | 2) => void

  // activeGuidelineLoading is whether the guideline is currently loading (animate the card)
  activeGuidelineLoading: boolean
  setActiveGuidelineLoading: (activeGuidelineLoading: boolean) => void

  // isRevising is whether the user is currently revising a guideline
  isRevising: boolean
  setIsRevising: (isRevising: boolean) => void

  triggerClearMessages: boolean
  setTriggerClearMessages: (triggerClearMessages: boolean) => void

  seenGuidelineIds: string[]
  setSeenGuidelineIds: (seenGuidelineIds: string[]) => void
  addSeenGuidelineId: (guidelineId: string) => void
  clearSeenGuidelineIds: () => void

  triggerAutoSelectGuideline: boolean
  setTriggerAutoSelectGuideline: (triggerAutoSelectGuideline: boolean) => void
}

export const usePlaygroundStore = create<State>((set) => ({
  topicId: null,
  setTopicId: (topicId) => set({ topicId }),

  activeGuideline: null,
  setActiveGuideline: (activeGuideline) => set({ activeGuideline }),

  activeType: 0,
  setActiveType: (activeType: 0 | 1 | 2) => set({ activeType }),

  activeGuidelineLoading: false,
  setActiveGuidelineLoading: (activeGuidelineLoading) => set({ activeGuidelineLoading }),

  isRevising: false,
  setIsRevising: (isRevising) => set({ isRevising }),

  triggerClearMessages: false,
  setTriggerClearMessages: (triggerClearMessages) => set({ triggerClearMessages }),

  seenGuidelineIds: [],
  setSeenGuidelineIds: (seenGuidelineIds) => set({ seenGuidelineIds }),
  addSeenGuidelineId: (guidelineId) => set((state) => ({ seenGuidelineIds: [...state.seenGuidelineIds, guidelineId] })),
  clearSeenGuidelineIds: () => set({ seenGuidelineIds: [] }),

  triggerAutoSelectGuideline: false,
  setTriggerAutoSelectGuideline: (triggerAutoSelectGuideline) => set({ triggerAutoSelectGuideline }),
}))
