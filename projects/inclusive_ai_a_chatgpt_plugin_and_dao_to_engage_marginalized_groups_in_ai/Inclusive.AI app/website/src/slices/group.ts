import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export interface GroupState {
  // Randomly assigned by the server (data is updated by frontend)
  id: string
  // valueTopics: string[],
  valueQuestions: string[]
}

// Define the initial state using that type
const initialState: GroupState = {
  id: '',
  // valueTopics: [],
  valueQuestions: [],
}

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    updateGroup: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    },
    addValueQuestion: (state, action: PayloadAction<string>) => {
      state.valueQuestions.push(action.payload)
    },
  },
})

export const { addValueQuestion, updateGroup } = groupSlice.actions

export const selectGroupId = (state: RootState) => state.group.id
export const selectValueQuestions = (state: RootState) =>
  state.group.valueQuestions

export default groupSlice.reducer
