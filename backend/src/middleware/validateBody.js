const formatZodError = (error) => {
  const issues = error.issues || error.errors || [];
  return issues.map((e) => ({
    campo: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
    mensaje: e.message,
  }));
};

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (error) {
      const errors = formatZodError(error);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Datos inválidos', errors });
      }
      return res.status(400).json({ message: 'Datos inválidos', error: error.message });
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const errors = formatZodError(error);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Parámetro inválido', errors });
      }
      return res.status(400).json({ message: 'Parámetro inválido', error: error.message });
    }
  };
};
