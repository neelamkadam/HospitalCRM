import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authDataReducer from "./AuthSlice";
import themeSlice from "./themeSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Import storage from redux-persist
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import registerUserSlice from "./RegisterUser";
import searchSlice from "./GlobalSearch";
import DashBoardSlice from "./DashBoardSlice";
import chatSlice  from "./chatSlice";
import broadcastSlice from "./broadcastSlice";

const rootReducer = combineReducers({
  authData: authDataReducer,
  theme: themeSlice,
  registerUserData: registerUserSlice,
  chat: chatSlice,
  searchData: searchSlice,
  DashBoardData: DashBoardSlice,
  broadcast: broadcastSlice,
});

const persistConfig = {
  key: "root",
  storage, // Use the imported storage here
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
