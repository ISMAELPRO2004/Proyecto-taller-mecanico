import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Formato no permitido. Usa JPG, PNG o WEBP.'));
  },
});

export const uploadFoto = (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen no puede superar 5 MB'
      : (err.message || 'No se pudo subir la imagen');
    return res.status(400).json({ message });
  });
};
