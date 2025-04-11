import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import ambienteRoutes from './routes/ambientes.routes.js';
import maquinaRoutes from './routes/maquinas.routes.js';
import mantenimientoMaquinaRoutes from './routes/mantenimientos_maquinas.routes.js';
import mantenimientoAmbienteRoutes from './routes/mantenimientos_ambientes.routes.js';
import tablasRoutes from './routes/tablas.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Usa variable de entorno para mayor flexibilidad
    credentials: true, // Necesario para manejar cookies en solicitudes cross-origin
}));
app.use(express.json());
app.use(cookieParser()); //para manejar y acceder de forma más sencilla a las cookies
app.use(morgan('dev'));

app.use("/api", authRoutes);
app.use("/api", ambienteRoutes);
app.use("/api", maquinaRoutes);
app.use("/api", mantenimientoMaquinaRoutes);
app.use("/api", mantenimientoAmbienteRoutes);
app.use("/api", tablasRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


export default app;