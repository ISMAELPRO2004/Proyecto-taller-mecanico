/** Lo escrito en la orden de taller sobrevive a un F5 o a que el celular recargue al abrir la cámara. */

const CLAVE = 'lyer.taller.borrador';
const CLAVE_RECARGA = 'lyer.taller.recarga';
const DB = 'lyer-taller';
const STORE = 'foto';

export const leerBorradorTaller = () => {
  try {
    const raw = sessionStorage.getItem(CLAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const guardarBorradorTaller = (datos) => {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    /* cuota llena: la orden del servidor sigue siendo la base */
  }
};

export const marcarRecargaTaller = () => {
  try {
    sessionStorage.setItem(CLAVE_RECARGA, '1');
  } catch {
    /* ignore */
  }
};

export const consumirRecargaTaller = () => {
  try {
    const recarga = sessionStorage.getItem(CLAVE_RECARGA) === '1';
    sessionStorage.removeItem(CLAVE_RECARGA);
    return recarga;
  } catch {
    return false;
  }
};

export const limpiarBorradorTaller = () => {
  try {
    sessionStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE_RECARGA);
  } catch {
    /* ignore */
  }
  return borrarFotosTaller();
};

const abrirDb = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB, 1);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export const guardarFotoTaller = async (clave, file) => {
  const db = await abrirDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, String(clave));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

export const leerFotoTaller = async (clave) => {
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
  return new File([file], 'foto.jpg', { type: file.type || 'image/jpeg' });
};

export const borrarFotoTaller = async (clave) => {
  const db = await abrirDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(String(clave));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const borrarFotosTaller = async () => {
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
