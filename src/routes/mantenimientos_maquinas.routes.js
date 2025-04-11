import { Router } from "express";
import {createMantenimientoMaquinaController, getMantenimientoMaquinaByIdController, getAllMantenimientosMaquinasController, updateMantenimientoMaquinaController, deleteMantenimientoMaquinaController } from "../controllers/mantenimientos_maquinas.controllers.js";
import { getMantenimientosMaquinasPDF } from "../controllers/reportsPDF.controllers.js";
import { getMantenimientosMaquinasExcel } from "../controllers/reportsExcel.controllers.js";
import { requiredAuth } from "../middlewares/tokenValidation.js";
import { upload, handleMulterError } from "../config/multerConfig.js";

const router = Router();

// Definición de rutas con middlewares
router.get("/mantenimientos/maquinas", requiredAuth,  getAllMantenimientosMaquinasController);
router.get("/mantenimientos/maquinas/:id_mantenimiento", requiredAuth, getMantenimientoMaquinaByIdController);
router.post("/mantenimientos/maquinas", requiredAuth, upload, handleMulterError, createMantenimientoMaquinaController);
router.put("/mantenimientos/maquinas/:id_mantenimiento", upload, handleMulterError, requiredAuth, updateMantenimientoMaquinaController);
router.delete("/mantenimientos/maquinas/:id_mantenimiento", requiredAuth, deleteMantenimientoMaquinaController);

router.get("/mantenimientos/maquinas/report/pdf", requiredAuth, getMantenimientosMaquinasPDF);
router.get("/mantenimientos/maquinas/report/excel", requiredAuth, getMantenimientosMaquinasExcel);

export default router;