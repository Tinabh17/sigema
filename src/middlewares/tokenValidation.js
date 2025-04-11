import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";

export const requiredAuth = (req, res, next) => {
    try {
        // Obtener el token desde cookies o headers
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Acceso denegado: No se proporcionó un token" });
        }

        jwt.verify(token, TOKEN_SECRET, (err, user) => {
            if (err) {
                const errorMessage = err.name === "TokenExpiredError"
                    ? "Token expirado"
                    : "Token inválido";

                return res.status(403).json({ message: errorMessage });
            }

            req.user = user; // Guardar usuario en `req`
            next();
        });

    } catch (error) {
        console.error("Error en autenticación:", error);
        return res.status(500).json({ message: "Error interno en la autenticación" });
    }
};
