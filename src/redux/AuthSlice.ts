import { createSlice } from "@reduxjs/toolkit";
import { User } from "../types/response.types";

export interface NavStateType {
  userData: User;
  authToken?: string;
  resendOtpTimer: number;
}

const initialState: NavStateType = {
  userData: {},
  authToken: "",
  resendOtpTimer: 0,
};

export const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    resetAuthSlice: () => initialState,
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
    },
    setResendOtpTimer: (state, action) => {
      state.resendOtpTimer = action.payload;
    },
    decrementResendOtpTimer: (state) => {
      if (state.resendOtpTimer > 0) {
        state.resendOtpTimer -= 1;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { resetAuthSlice, setUserData, setAuthToken, setResendOtpTimer, decrementResendOtpTimer } = authSlice.actions;

export default authSlice.reducer;
