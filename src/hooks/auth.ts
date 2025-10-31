import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cart";
import toast from "react-hot-toast";

type State = {
    access: string;
    refresh: string;
    isAuth: boolean;
    role: string;
};

type Actions = {
    setToken: (access: string, refresh: string) => void;
    logout: () => void;
};

export const useAuthStore = create(
    persist<State & Actions>(
        (set) => ({
            access: '',
            refresh: '',
            isAuth: false,
            role: '',
            setToken: (access: string, refresh: string) =>
                set(() => ({
                    access,
                    refresh,
                    isAuth: !!access && !!refresh,
                })),
            logout: () => {
                useCartStore.getState().removeAll();
                set(() => ({
                    access: '',
                    refresh: '',
                    isAuth: false,
                    role: '',
                }));
                toast.success("Sesión cerrada y carrito limpiado.");
            },
        }),
        {
            name: "auth",
            getStorage: () => localStorage,
        }
    )
);
