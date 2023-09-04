import { configureStore, useDispatch } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    one: oneSlice.reducer,
    two: twoSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
