import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";

import rootReducer from "./store/reducers/rootReducer";

const environment = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.MODE) || process.env.NODE_ENV || "development";
const isDevelopment = environment === "development";

const reduxStore = configureStore({
    reducer: rootReducer,
    devTools: isDevelopment,
    // Disable immutability/serializable checks because redux-persist injects non-serializable values
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }),
});

export const dispatch = reduxStore.dispatch;

export const persistor = persistStore(reduxStore);

export default reduxStore;
