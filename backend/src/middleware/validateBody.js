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

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse({ ...(req.query ?? {}) });
      next();
    } catch (error) {
      const errors = formatZodError(error);
      if (errors.length > 0) {
        return res.status(400).json({ message: errors[0]?.mensaje || 'Consulta inválida', errors });
      }
      return res.status(400).json({ message: 'Consulta inválida', error: error.message });
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.params ?? {});
      req.validatedParams = parsed;
      for (const [key, value] of Object.entries(parsed)) {
        req.params[key] = value;
      }
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
