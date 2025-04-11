export const validateSchema = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos inválidos",
            errors: result.error.format() // Usa `format()` para mejor estructura
        });
    }

    req.validatedBody = result.data; // Guarda los datos validados en `req`
    next();
};
