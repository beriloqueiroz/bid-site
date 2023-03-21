import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import initialState, { GeneralState } from '../state/initial';

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    _apply: <T extends GeneralState, U extends keyof GeneralState>(state: T, action: PayloadAction<{ key: U, value: any }>) => {
      let value;

      if (typeof action.payload.value === 'object') {
        value = { ...state[action.payload.key], ...action.payload.value };
      } else if (typeof action.payload.value === 'function') {
        value = action.payload.value(state[action.payload.key]);
        action.payload.value = undefined;
      } else {
        value = action.payload.value;
      }

      state[action.payload.key] = value || initialState[action.payload.key];
    },
  },
});

export default generalSlice.reducer;
