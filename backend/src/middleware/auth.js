import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es requerido en las variables de entorno');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user; // Guardamos el ID y ROL
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const authorize = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
};