import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '../../utils/logger.js';

const DIR_PLACAS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../ml/placas');
const SCRIPT = path.join(DIR_PLACAS, 'reconocer.py');
const DIR_MODELOS = path.join(DIR_PLACAS, 'modelos');
const DIR_MODELOS_IMAGEN = process.env.PLACA_MODELO_DIR || '/opt/placas-modelo';
const CANDIDATOS = ['best.pt', 'best.onnx', 'placa.pt', 'yolo.pt'];
const SIN_MODELO = {
  disponible: false,
  placa: null,
  confianza: null,
  mensaje: 'Confirma la placa con la foto.',
};

const extensionDe = (mimetype = '') => {
  if (mimetype.includes('png')) return '.png';
  if (mimetype.includes('webp')) return '.webp';
  return '.jpg';
};

const buscarPesoEn = (carpeta) => {
  if (!carpeta) return null;
  return CANDIDATOS.map((nombre) => path.join(carpeta, nombre)).find((ruta) => existsSync(ruta)) || null;
};

export const rutaModeloPlaca = () => {
  const indicado = process.env.PLACA_MODELO;
  if (indicado && existsSync(indicado)) return indicado;
  return buscarPesoEn(DIR_MODELOS) || buscarPesoEn(DIR_MODELOS_IMAGEN) || null;
};

const pythonBin = () => {
  if (process.env.PYTHON) return process.env.PYTHON;
  const enVenv = process.platform === 'win32'
    ? path.join(DIR_PLACAS, '.venv', 'Scripts', 'python.exe')
    : path.join(DIR_PLACAS, '.venv', 'bin', 'python');
  return existsSync(enVenv) ? enVenv : 'python';
};

const correrPython = (imagen, modelo) => new Promise((resolve, reject) => {
  const hijo = spawn(pythonBin(), [SCRIPT, '--imagen', imagen, '--modelo', modelo], {
    cwd: DIR_PLACAS,
    windowsHide: true,
    env: { ...process.env, YOLO_VERBOSE: 'False' },
  });

  let stdout = '';
  let stderr = '';
  const timer = setTimeout(() => {
    hijo.kill();
    reject(new Error('El reconocimiento tardó demasiado'));
  }, 90000);

  hijo.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  hijo.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  hijo.on('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  hijo.on('close', () => {
    clearTimeout(timer);
    const linea = stdout.trim().split('\n').filter(Boolean).at(-1);
    if (!linea) {
      const detalle = stderr.trim().slice(-400) || 'El script de placas no devolvió datos';
      reject(new Error(detalle));
      return;
    }
    try {
      resolve(JSON.parse(linea));
    } catch {
      reject(new Error('Respuesta inválida del modelo de placas'));
    }
  });
});

/** Si no hay peso en modelos/, no inventa dígitos. Si hay, llama al YOLO. */
export const reconocerConYolo = async (file) => {
  const modelo = rutaModeloPlaca();
  if (!modelo || !existsSync(SCRIPT)) {
    log.warn('Modelo de placas: no hay peso YOLO', {
      script: existsSync(SCRIPT),
      modelos: DIR_MODELOS,
      imagen: DIR_MODELOS_IMAGEN,
    });
    return SIN_MODELO;
  }

  const tmp = path.join(os.tmpdir(), `lyer-placa-${randomUUID()}${extensionDe(file.mimetype)}`);
  try {
    log.info('Modelo de placas: ejecutando', { python: pythonBin(), modelo });
    await writeFile(tmp, file.buffer);
    const data = await correrPython(tmp, modelo);
    log.info('Modelo de placas: respuesta', {
      placa: data?.placa || null,
      confianza: data?.confianza ?? null,
      texto: data?.texto || null,
      error: data?.error || null,
    });
    if (!data?.ok) {
      log.warn('Modelo de placas: no pudo leer', { error: data?.error });
      return {
        disponible: true,
        placa: null,
        confianza: null,
        mensaje: 'Confirma la placa con la foto.',
      };
    }
    return {
      disponible: true,
      placa: data.placa || null,
      confianza: data.confianza ?? null,
      mensaje: 'Confirma la placa con la foto.',
    };
  } catch (error) {
    log.warn('Modelo de placas: falló la llamada a Python', { mensaje: error.message });
    return {
      disponible: false,
      placa: null,
      confianza: null,
      mensaje: 'Confirma la placa con la foto.',
    };
  } finally {
    await unlink(tmp).catch(() => {});
  }
};
