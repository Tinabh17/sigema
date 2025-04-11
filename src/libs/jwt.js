import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";
import { promisify } from "util"; // Convierte funciones con callbacks en Promesas

const signAsync = promisify(jwt.sign);

export async function createTokenAccess(payload) {
    try {
        return await signAsync(payload, TOKEN_SECRET, { expiresIn: "1d" });
    } catch (err) {
        throw new Error("Error al generar el token");
    }
}