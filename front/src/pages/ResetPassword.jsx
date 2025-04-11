import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const res = await axios.post(`/reset/${token}`, { password });
            setMessage(res.data.message);
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Error en el servidor");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-pattern">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Restablecer Contraseña</h2>

                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#00af00] text-white py-3 rounded-xl hover:bg-green-600 transition"
                    >
                        Restablecer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
