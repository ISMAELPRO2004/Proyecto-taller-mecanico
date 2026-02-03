export const authorize = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
};