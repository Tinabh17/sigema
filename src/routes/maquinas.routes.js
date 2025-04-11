import { Router } from "express";
import {createMaquinaController, getMaquinaByIdController, getAllMaquinasController, updateMaquinaController, deleteMaquinaController } from "../controllers/maquinas.controllers.js";
import { getMaquinasPDF } from "../controllers/reportsPDF.controllers.js";
import { getMaquinasExcel } from "../controllers/reportsExcel.controllers.js";
import { requiredAuth } from "../middlewares/tokenValidation.js";
import { upload, handleMulterError } from "../config/multerConfig.js";

const router = Router();

// Definición de rutas con middlewares
router.get("/maquinas", requiredAuth, getAllMaquinasController);
router.get("/maquinas/:id_maquina", requiredAuth, getMaquinaByIdController);
router.post("/maquinas", requiredAuth, upload, handleMulterError, createMaquinaController);
router.put("/maquinas/:id_maquina", requiredAuth, upload, handleMulterError, updateMaquinaController);
router.delete("/maquinas/:id_maquina", requiredAuth, deleteMaquinaController);

router.get("/maquinas/report/pdf", requiredAuth, getMaquinasPDF);
router.get("/maquinas/report/excel", requiredAuth, getMaquinasExcel);

export default router;