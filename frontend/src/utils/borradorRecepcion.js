/** El avance de recepción sobrevive a un F5 o a que el celular recargue al abrir la cámara. */

const CLAVE = 'lyer.recepcion.borrador';
const CLAVE_RECARGA = 'lyer.recepcion.recarga';
const DB = 'lyer-recepcion';
const STORE = 'foto';

export const leerBorradorLocal = () => {
  try {
    const raw = sessionStorage.getItem(CLAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const guardarBorradorLocal = (datos) => {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    /* cuota llena: el borrador del servidor sigue siendo la base */
  }
};

export const marcarRecargaRecepcion = () => {
  try {
    sessionStorage.setItem(CLAVE_RECARGA, '1');
  } catch {
    /* ignore */
  }
};

export const consumirRecargaRecepcion = () => {
  try {
    const recarga = sessionStorage.getItem(CLAVE_RECARGA) === '1';
    sessionStorage.removeItem(CLAVE_RECARGA);
    return recarga;
  } catch {
    return false;
  }
};

export const limpiarBorradorLocal = () => {
  try {
    sessionStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE_RECARGA);
  } catch {
    /* ignore */
  }
  return borrarFotosLocales();
};

const abrirDb = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB, 1);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export const guardarFotoLocal = async (clave, file) => {
  const db = await abrirDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, String(clave));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

export const leerFotoLocal = async (clave) => {
  const db = await abrirDb();
  const file = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(String(clave));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!file) return null;
  if (file instanceof File) return file;
  return new File([file], 'registro.jpg', { type: file.type || 'image/jpeg' });
};

export const borrarFotoLocal = async (clave) => {
  const db = await abrirDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(String(clave));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const borrarFotosLocales = async () => {
  try {
    const db = await abrirDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
};
