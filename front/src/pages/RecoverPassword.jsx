import { useState } from "react";
import axios from "../api/axios";

const RecoverPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRequestRecovery = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const res = await axios.post("/recover", { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Error en el servidor");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-pattern">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Recuperar Contraseña</h2>

                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                <form onSubmit={handleRequestRecovery}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Ingrese su Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#00af00] text-white py-3 rounded-xl hover:bg-green-600 transition"
                    >
                        Recuperar
                    </button>

                    <p className="text-black text-sm text-center">
                        Volver al inicio de sesión <a href="/" className="text-green-700 font-semibold"> aquí</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RecoverPassword;
