// Función para obtener el token del localStorage
export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };
  
  // Función para verificar si el usuario está autenticado
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  // Función para obtener el ID del usuario del localStorage
  export const getUserIdFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      // Primero intentamos obtener el ID del userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.id) {
            return parsed.id;
          }
        } catch (e) {
          console.error("Error al parsear userData:", e);
        }
      }
      
      // Si no hay userData, intentamos obtener el userId directamente
      const userId = localStorage.getItem('userId');
      if (userId) {
        return parseInt(userId, 10);
      }
    }
    return null;
  };
  
  // Función para obtener el usuario actual
  export const getCurrentUser = async () => {
    try {
      // Si estamos en el navegador, intentamos obtener el usuario del localStorage
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            return JSON.parse(userData);
          } catch (e) {
            console.error("Error al parsear userData:", e);
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
      return null;
    }
  };
  
  // Función para guardar el usuario en localStorage
  export const saveUserToLocalStorage = (user: any) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('userData', JSON.stringify(user));
      if (user.id) {
        localStorage.setItem('userId', user.id.toString());
      }
    }
  };
  