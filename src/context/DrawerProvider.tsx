import React, { createContext, useContext, useState } from 'react';

// Definir el tipo del contexto para mayor seguridad con TypeScript
interface DrawerContextType {
    abierto: boolean;
    toggleAbierto: () => void;
}

// Proporcionar un valor predeterminado para el contexto
const defaultDrawerContext: DrawerContextType = {
    abierto: false,
    toggleAbierto: () => { }
};

// Crear un contexto con un valor predeterminado
const DrawerContext = createContext<DrawerContextType>(defaultDrawerContext);

// Proveedor de contexto
export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [abierto, setAbierto] = useState(false);

    const toggleAbierto = () => {
        setAbierto(prevState => !prevState);
    };

    return (
        <DrawerContext.Provider value={{ abierto, toggleAbierto }}>
            {children}
        </DrawerContext.Provider>
    );
};

// Hook para usar el contexto en otros componentes
export const useDrawer = () => useContext(DrawerContext);
