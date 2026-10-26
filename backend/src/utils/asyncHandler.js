/**
 * Pasa los errores al middleware global. Los controladores no necesitan try/catch.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
