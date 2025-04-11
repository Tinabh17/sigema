import { Router } from "express";
import {createMantenimientoAmbienteController, getMantenimientoAmbienteByIdController, getAllMantenimientosAmbientesController, updateMantenimientoAmbienteController, deleteMantenimientoAmbienteController } from "../controllers/mantenimientos_ambientes.controllers.js";
import {getMantenimientosAmbientesPDF } from "../controllers/reportsPDF.controllers.js";
import { getMantenimientosAmbientesExcel } from "../controllers/reportsExcel.controllers.js";
import { requiredAuth } from "../middlewares/tokenValidation.js";
import { upload, handleMulterError } from "../config/multerConfig.js";

const router = Router();

// Definición de rutas con middlewares
router.get("/mantenimientos/ambientes", requiredAuth,  getAllMantenimientosAmbientesController);
router.get("/mantenimientos/ambientes/:id_mantenimiento", requiredAuth, getMantenimientoAmbienteByIdController);
router.post("/mantenimientos/ambientes", requiredAuth, upload, handleMulterError, createMantenimientoAmbienteController);
router.put("/mantenimientos/ambientes/:id_mantenimiento", requiredAuth, upload, handleMulterError, updateMantenimientoAmbienteController);
router.delete("/mantenimientos/ambientes/:id_mantenimiento", requiredAuth, deleteMantenimientoAmbienteController);

router.get("/mantenimientos/ambientes/report/pdf", requiredAuth, getMantenimientosAmbientesPDF);
router.get("/mantenimientos/ambientes/report/excel", requiredAuth, getMantenimientosAmbientesExcel);

export default router;