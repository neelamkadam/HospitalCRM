import React from "react";
import "./App.css";
// import { ThemeProvider } from "./context/ThemeProvider";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={AppRoutes} />
        <ToastContainer
          toastClassName={(context) =>
            context?.type === "success"
              ? "relative flex p-3 rounded-md justify-between items-center bg-[#01576A] text-white"
              : context?.type === "error"
                ? "relative flex p-3 rounded-md justify-between items-center bg-[#F5F6F6] text-[#1A2435]"
                : "relative flex p-3 rounded-md justify-between items-center"
          }
        />
      </PersistGate>
    </Provider>
  );
};

export default App;
