import { Router } from 'express';
import { getAllRoles, getAllDocumentos, getAllEstados, getAllTiposAmbientes, getAllEstadoMantenimiento, getAllTiposMantenimientos } from '../controllers/tablas.controllers.js';

const router = Router();


router.get("/getRol", getAllRoles);
router.get("/getDoc", getAllDocumentos);
router.get("/getEst", getAllEstados);
router.get("/getTipoA", getAllTiposAmbientes);
router.get("/getEstM", getAllEstadoMantenimiento);
router.get("/getTipoM", getAllTiposMantenimientos);

export default router;