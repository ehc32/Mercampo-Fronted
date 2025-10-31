import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import '@mui/icons-material';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DrawerProvider } from './context/DrawerProvider.tsx';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <DrawerProvider>
                <App />
            </DrawerProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
