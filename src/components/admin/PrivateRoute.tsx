import jwt_decode from 'jwt-decode';
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../hooks/auth";
import { Token } from "../../Interfaces";

interface PrivateRouteProps {
    allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
    const { isAuth, access: token } = useAuthStore();

    if (!isAuth) {
        return <Navigate to='/login' />;
    }

    // Si se especifican roles permitidos, validar el rol del usuario
    if (allowedRoles && allowedRoles.length > 0) {
        if (!token) {
            return <Navigate to='/login' />;
        }

        try {
            const tokenDecoded: Token = jwt_decode(token);
            const userRole = tokenDecoded.role;

            // Verificar si el rol del usuario está en la lista de roles permitidos
            if (!allowedRoles.includes(userRole)) {
                return <Navigate to='/login' />;
            }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return <Navigate to='/login' />;
        }
    }

    return <Outlet />;
};

interface AdminPrivateRouteProps {
    allowedRoles?: string[];
}

export const AdminPrivateRoute = ({ allowedRoles }: AdminPrivateRouteProps) => {
    const { isAuth, access: token } = useAuthStore();

    if (!token) {
        console.error("Error: No token found");
        return <Navigate to='/login' />;
    }

    try {
        const tokenDecoded: Token = jwt_decode(token);
        const userRole = tokenDecoded.role;

        // Si se especifican roles, validarlos; sino, por defecto solo admin
        const validRoles = allowedRoles && allowedRoles.length > 0 ? allowedRoles : ['admin'];
        
        // Verifica si el rol del usuario está en los roles permitidos
        return isAuth && validRoles.includes(userRole) ? <Outlet /> : <Navigate to='/login' />;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return <Navigate to='/login' />;
    }
};
