import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000; // Usa el puerto de .env o 5000 por defecto

const startServer = async () => {
    try {
        await connectDB(); // Conectar a la base de datos
        app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Finaliza la ejecución en caso de error crítico
    }
};

startServer();
