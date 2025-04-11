import mysql from "mysql2/promise";

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Valentina1028140290",
    database: "SIGEMA",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const connectDB = async () => {
    try {
        const connection = await db.getConnection(); // Obtener conexión
        console.log(">> DB Connected ");
        connection.release(); // Liberar conexión
    } catch (error) {
        console.error(" Database connection error:", error);
    }
};
