export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          message: 'Datos inválidos',
          errors: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
        });
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
      if (error.errors) {
        return res.status(400).json({
          message: 'Parámetro inválido',
          errors: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
        });
      }
      return res.status(400).json({ message: 'Parámetro inválido', error: error.message });
    }
  };
};
