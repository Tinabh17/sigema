import { createContext, useState, useContext, useEffect } from "react";
import { loginRequest, registerRequest, verifyTokenRequest, logoutRequest } from "../api/auth.js";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función de registro
    const signup = async (userData) => {
        try {
            const res = await registerRequest(userData);  
            console.log("Usuario registrado:", res.data);
        } catch (error) {
            console.log("Error en el registro:", error.response?.data);
            setErrors(error.response?.data || ["Error al registrar usuario"]);
        }
    };

    // Inicio de sesión
// Inicio de sesión
const signin = async (userData) => {
    try {
        console.log("Datos enviados al backend:", userData); 
        const res = await loginRequest(userData);
        setUser(res.data);
        setIsAuthenticated(true);

        const userRol = res.data.rol; 
        return userRol; 
    } catch (error) {
        console.error("Error en inicio de sesión:", error.response?.data);
        setErrors(error.response?.data?.message ? [error.response.data.message] : ["Error al iniciar sesión"]);
    }
};

    
    // Función de cierre de sesión
    const logout = async () => {
        try {
            await logoutRequest(); // Petición al backend para cerrar sesión
            Cookies.remove("token"); // Eliminar la cookie de autenticación
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Limpiar errores después de 5 segundos
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => setErrors([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const checkLogin = async () => {
            const token = Cookies.get("token");

            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return setUser(null);
            }

            try {
                const res = await verifyTokenRequest();
                if (!res.data) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            signup, 
            signin, 
            logout, 
            user, 
            isAuthenticated, 
            errors, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
