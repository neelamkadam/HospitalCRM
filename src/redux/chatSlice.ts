import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  chatId: string | null;
  isOpen: boolean;
}

const initialState: ChatState = {
  chatId: null,
  isOpen: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    setChatId: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
  },
});

export const { openChat, closeChat, setChatId } = chatSlice.actions;
export default chatSlice.reducer;
