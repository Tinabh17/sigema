import { createUser, getUserById, getAllUsers, updateUser, deleteUser, getUserByDocumento, getUserByEmail, updatePassword } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { createTokenAccess } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función para enviar el correo de registro
const registerNoti = async (email, nombre) => {
    try {
        const info = await transporter.sendMail({
            from: '"SIGEMA" <sigemasena@gmail.com>',
            to: email,
            subject: 'El Sistema de Gestión de Maquinaria te da la bienvenida',
            html: `
                <h2>${nombre}</h2>
                <p>Si recibiste este correo un administrador de la pataforma te ha registrado y ahora podrás disfrutar de todas nuestras funciones</p>
                <p>Tus credenciales de acceso son:</p>
                    <ul>
                        <li>Usuario: Número de cédula</li>
                        <li>Contraseña temporal: 123456789</li>
                    </ul>
                <p>Recuerda cambiar la contraseña temporal, en el link de ¿Olvidaste tu contraseña?</p>
                <p>Puedes acceder a la página en el siguiente enlace:</p>
                <a href="http://localhost:5173/">Ir a la página</a>
                <br>
                <p>Atentamente,</p>
                <p>SIGEMA</p>
            `
        });
        console.log('Correo enviado: ', info.messageId);
    } catch (error) {
        console.error('Error enviando el correo:', error);
    }
};
// REGISTRO DE USUARIO
export const register = async (req, res) => {
    const { tipo_documento, numero_documento, nombre, apellido, email, telefono, direccion, password, rol } = req.body;

    try {
        const existingUser = await getUserByDocumento(numero_documento);
        if (existingUser) return res.status(400).json({ message: "El número de documento ya está en uso" });

        const existingEmail = await getUserByEmail(email);
        if (existingEmail) return res.status(400).json({ message: "El correo electrónico ya está en uso" });

        const passwordHash = await bcrypt.hash(password, 10);

        const newUserId = await createUser({
            tipo_documento,
            numero_documento,
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            password: passwordHash,
            rol,
        });

        const newUser = await getUserById(newUserId);
        delete newUser.password;

        // Enviar el correo 
        await registerNoti (email, nombre);


        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// LOGIN DE USUARIO
export const login = async (req, res) => {
    const { tipo_documento, numero_documento, password } = req.body;

    try {
        const userFound = await getUserByDocumento(numero_documento);
        if (!userFound || userFound.tipo_documento !== tipo_documento) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ message: "Error en credenciales" });

        const token = await createTokenAccess({ id: userFound.id_usuario, rol: userFound.rol });
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });

        delete userFound.password;
        res.status(200).json(userFound);
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// LOGOUT
export const logout = (req, res) => {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
    return res.sendStatus(200);
};

// PROFILE DE USUARIO
export const profile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const userFound = await getUserById(req.user.id);

        if (!userFound) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Excluir password en la respuesta
        if (userFound.password) {
            delete userFound.password;
        }

        res.status(200).json(userFound);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// VERIFICAR TOKEN
export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        const userFound = await getUserById(decoded.id);
        if (!userFound) return res.status(401).json({ message: "No autorizado" });

        delete userFound.password;
        return res.json(userFound);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } 
    catch (error) {
        console.error("Error details:", error);  
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
    
};

export const getUser = async (req, res) => {
    try {
        const id_usuario = parseInt(req.params.id_usuario, 10);
        if (isNaN(id_usuario)) return res.status(400).json({ error: "ID inválido" });
        
        const user = await getUserById(id_usuario);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener al usuario" });
    }
};

// Actualizar usuario
export const updateUserById = async (req, res) => {
    const { id_usuario } = req.params;
    const {tipo_documento, numero_documento, email, telefono, direccion, password, rol } = req.body;

    try {
        const userFound = await getUserById(id_usuario);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        let passwordHash = userFound.password;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await updateUser(id_usuario, {
            tipo_documento,
            numero_documento,
            email,
            telefono,
            direccion,
            password: passwordHash,
            rol
        });

        if (!updated) return res.status(400).json({ message: "No se pudo actualizar el usuario" });

        res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};

// Eliminar usuario
export const deleteUserById = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const deleted = await deleteUser(id_usuario);
        if (!deleted) return res.status(400).json({ message: "No se pudo eliminar el usuario" });

        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    const { id_usuario } = req.user; // Se obtiene del token
    const { password_actual, password_nuevo } = req.body;

    try {
        // Obtener usuario de la base de datos
        const userFound = await getUserById(id_usuario);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        // Verificar si la contraseña actual es correcta
        const isMatch = await bcrypt.compare(password_actual, userFound.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña actual incorrecta" });

        // Encriptar la nueva contraseña
        const passwordHash = await bcrypt.hash(password_nuevo, 10);

        // Guardar la nueva contraseña en la base de datos
        await updateUser(id_usuario, { password: passwordHash });

        res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// RECUPERACIÓN DE CONTRASEÑA
export const recoverPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Correo es requerido" });
    }

    try {
        const userFound = await getUserByEmail(email); 
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        const token = jwt.sign({ id: userFound.id_usuario }, TOKEN_SECRET, { expiresIn: "15m" });
        const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;

        // Configurar transporte SMTP usando Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: userFound.email,
            subject: "Recuperación de contraseña",
            html: `
                <h2>Recuperación de Contraseña</h2>
                <p>Hola ${userFound.nombre},</p>
                <p>Haz clic en el botón para restablecer tu contraseña:</p>
                <a href="${resetLink}" style="background: green; color: #ffffff; padding: 10px; text-decoration: none;">
                    Restablecer contraseña
                </a>
                <p>O copia y pega este enlace en tu navegador: ${resetLink}</p>
                <p>Este enlace expirará en 15 minutos.</p>
            `,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Correo de recuperación enviado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// RESETEO DE CONTRASEÑA
export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        const userFound = await getUserById(decoded.id);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        const passwordHash = await bcrypt.hash(password, 10);
        await updatePassword(decoded.id, { password: passwordHash });

        res.status(200).json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer la contraseña", error: error.message });
    }
};

