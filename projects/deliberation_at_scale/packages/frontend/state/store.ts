import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import profileSlice from './slices/profile';
import roomSlice from './slices/room';
import flowSlice from './slices/flow';

const store = configureStore({
    reducer: {
        profile: profileSlice.reducer,
        room: roomSlice.reducer,
        flow: flowSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
