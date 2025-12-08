import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NavStateType {
  selectedPeriod: string;
}

const initialState: NavStateType = {
  selectedPeriod: "month",
};

export const DashBoardSlice = createSlice({
  name: "DashBoardSlice",
  initialState,
  reducers: {
    setSelectedPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedPeriod } = DashBoardSlice.actions;

export default DashBoardSlice.reducer;
