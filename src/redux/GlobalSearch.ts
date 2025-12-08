// GlobalSearch.ts - Fixed Redux slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NavStateType {
  patientSearch: string;
  reportSearch: string;
  teamLogsSearch: string;
  OrgnazationSearch?: string;
  OrgnazationTeamSearch?: string;
  BillingSearch?: string;
}

const initialState: NavStateType = {
  patientSearch: "",
  reportSearch: "",
  teamLogsSearch: "",
  OrgnazationSearch: "",
  OrgnazationTeamSearch: "",
  BillingSearch: "",
};

export const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchDataSlice(state) {
      state.patientSearch = "";
      state.reportSearch = "";
      state.teamLogsSearch = "";
      state.OrgnazationSearch = "";
      state.OrgnazationTeamSearch = ""; // FIXED: Added missing reset
      state.BillingSearch = "";
    },
    setPatientSearch: (state, action: PayloadAction<string>) => {
      state.patientSearch = action.payload;
    },
    setReportsSearch: (state, action: PayloadAction<string>) => {
      state.reportSearch = action.payload;
    },
    setTeamLogsSearch: (state, action: PayloadAction<string>) => {
      state.teamLogsSearch = action.payload;
    },
    setOrgnazationSearch: (state, action: PayloadAction<string>) => {
      state.OrgnazationSearch = action.payload;
    },
    setOrgnazationTeamSearch: (state, action: PayloadAction<string>) => {
      state.OrgnazationTeamSearch = action.payload;
    },
    setBillingSearch: (state, action: PayloadAction<string>) => {
      state.BillingSearch = action.payload;
    },
  },
});

// FIXED: Added missing export for setOrgnazationTeamSearch
export const {
  resetSearchDataSlice,
  setPatientSearch,
  setReportsSearch,
  setTeamLogsSearch,
  setOrgnazationSearch,
  setOrgnazationTeamSearch,
  setBillingSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
