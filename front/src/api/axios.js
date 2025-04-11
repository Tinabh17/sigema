import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Usa variable de entorno
    withCredentials: true, // Importante para enviar cookies de sesión
    headers: {
        "Content-Type": "application/json",
    },
});

export default instance;