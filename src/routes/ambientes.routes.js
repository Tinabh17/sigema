import { Router } from "express";
import {createAmbienteController, getAmbienteByIdController, getAllAmbientesController, updateAmbienteController, deleteAmbienteController } from "../controllers/ambientes.controllers.js";
import { getAmbientesPDF } from "../controllers/reportsPDF.controllers.js";
import { getAmbientesExcel } from "../controllers/reportsExcel.controllers.js";
import { requiredAuth } from "../middlewares/tokenValidation.js";
import { upload, handleMulterError } from "../config/multerConfig.js";

const router = Router();

// Definición de rutas con middlewares
router.get("/ambientes", requiredAuth, getAllAmbientesController);
router.get("/ambientes/:id_ambiente", requiredAuth, getAmbienteByIdController);
router.post("/ambientes", requiredAuth, upload, handleMulterError, createAmbienteController);
router.put("/ambientes/:id_ambiente", requiredAuth, upload, handleMulterError, updateAmbienteController);
router.delete("/ambientes/:id_ambiente", requiredAuth, deleteAmbienteController);

router.get("/ambientes/report/pdf", requiredAuth, getAmbientesPDF);
router.get("/ambientes/report/excel", requiredAuth, getAmbientesExcel);

export default router;