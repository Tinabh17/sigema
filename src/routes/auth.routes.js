import { Router } from "express";
import { register, login, logout, profile, verifyToken, getUsers, getUser, updateUserById, deleteUserById, recoverPassword, resetPassword } from "../controllers/auth.controllers.js";
import { getUsersPDF, getUsersByRolPDF } from "../controllers/reportsPDF.controllers.js";
import { getUsersExcel, getUsersByRolExcel } from "../controllers/reportsExcel.controllers.js";
import { requiredAuth } from "../middlewares/tokenValidation.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { validateSchema } from "../middlewares/validator.middleware.js";


const router = Router();

router.post('/register', requiredAuth, validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', requiredAuth, logout);
router.get('/verify', requiredAuth, verifyToken);
router.get('/profile', requiredAuth, profile);

router.get("/usuarios", requiredAuth, getUsers);
router.get("/usuarios/:id_usuario", requiredAuth, getUser);
router.put("/usuarios/:id_usuario", requiredAuth, updateUserById);
router.delete("/usuarios/:id_usuario", requiredAuth, deleteUserById);

// Actualización y recuperación de contraseñas
router.post('/recover', recoverPassword); // Ruta para solicitar recuperación de contraseña
router.post('/reset/:token', resetPassword); // Ruta para restablecer la contraseña

router.get("/usuarios/report/pdf", requiredAuth, getUsersPDF);
router.get("/usuarios/report/excel", requiredAuth, getUsersExcel);
router.get("/usuarios/reportRol/pdf", requiredAuth, getUsersByRolPDF);
router.get("/usuarios/reportRol/excel", requiredAuth, getUsersByRolExcel);

export default router;