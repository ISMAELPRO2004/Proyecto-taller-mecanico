const CLAVE = 'lyer.tema';

export const temaGuardado = () =>
  (typeof localStorage !== 'undefined' && localStorage.getItem(CLAVE) === 'claro')
    ? 'claro'
    : 'oscuro';

export const aplicarTema = (tema) => {
  const valor = tema === 'claro' ? 'claro' : 'oscuro';
  document.documentElement.dataset.tema = valor;
  document.documentElement.dataset.theme = valor === 'claro' ? 'lyer-claro' : 'lyer';
  localStorage.setItem(CLAVE, valor);
};
