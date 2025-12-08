import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BroadcastState {
  selectedRows: string[];
}

const initialState: BroadcastState = {
  selectedRows: [],
};

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
    addSelectedRow: (state, action: PayloadAction<string>) => {
      if (!state.selectedRows.includes(action.payload)) {
        state.selectedRows.push(action.payload);
      }
    },
    removeSelectedRow: (state, action: PayloadAction<string>) => {
      state.selectedRows = state.selectedRows.filter(row => row !== action.payload);
    },
    clearSelectedRows: (state) => {
      state.selectedRows = [];
    },
  },
});

export const { setSelectedRows, addSelectedRow, removeSelectedRow, clearSelectedRows } = broadcastSlice.actions;
export default broadcastSlice.reducer;