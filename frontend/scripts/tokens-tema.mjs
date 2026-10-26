import fs from 'fs';
import path from 'path';

const raiz = path.resolve('src');
const omitir = `${path.sep}login${path.sep}`;

const pares = [
  ['bg-[#221433]/90', 'bg-lyer-card/90'],
  ['bg-[#10041f]/95', 'bg-lyer-barra/95'],
  ['bg-[#160c24]/95', 'bg-lyer-barra/95'],
  ['hover:bg-[#3a1260]', 'hover:bg-lyer-boton'],
  ['hover:bg-[#1c1030]', 'hover:bg-lyer-hover'],
  ['hover:bg-[#2a1840]', 'hover:bg-lyer-hover'],
  ['hover:bg-[#2a0a4a]', 'hover:bg-lyer-boton'],
  ['bg-[#3a1260]', 'bg-lyer-boton'],
  ['bg-[#2a0a4a]', 'bg-lyer-boton'],
  ['bg-[#2a1840]', 'bg-lyer-hover'],
  ['bg-[#1c1030]', 'bg-lyer-hover'],
  ['!bg-[#160a24]', '!bg-lyer-panel'],
  ['!border-[#4a2870]/60', '!border-lyer-linea/60'],
  ['bg-[#221433]', 'bg-lyer-card'],
  ['bg-[#160428]', 'bg-lyer-sidebar'],
  ['bg-[#160a24]', 'bg-lyer-panel'],
  ['bg-[#140a22]', 'bg-lyer-fondo'],
  ['bg-[#120818]', 'bg-lyer-hueco'],
  ['bg-[#10041f]', 'bg-lyer-barra'],
  ['bg-[#080d1a]', 'bg-lyer-fondo'],
  ['border-[#4a2870]/70', 'border-lyer-linea/70'],
  ['border-[#4a2870]/60', 'border-lyer-linea/60'],
  ['border-[#4a2870]/50', 'border-lyer-linea/50'],
  ['border-[#4a2870]/45', 'border-lyer-linea/45'],
  ['border-[#4a2870]/40', 'border-lyer-linea/40'],
  ['border-[#4a2870]/30', 'border-lyer-linea/30'],
  ['border-[#4a2870]/25', 'border-lyer-linea/25'],
  ['border-[#4a2870]', 'border-lyer-linea'],
  ['border-[#3d1570]/70', 'border-lyer-linea2/70'],
  ['border-[#3d1570]/60', 'border-lyer-linea2/60'],
  ['border-[#3d1570]', 'border-lyer-linea2'],
  ['divide-[#4a2870]/35', 'divide-lyer-linea/35'],
  ['divide-[#4a2870]/30', 'divide-lyer-linea/30'],
  ['divide-[#4a2870]/25', 'divide-lyer-linea/25'],
  ['hover:text-white', 'hover:text-lyer-fg'],
  ['placeholder:text-slate-600', 'placeholder:text-lyer-muted'],
  ['placeholder:text-slate-500', 'placeholder:text-lyer-muted'],
  ['text-slate-100', 'text-lyer-fg'],
  ['text-slate-200', 'text-lyer-fg'],
  ['text-slate-300', 'text-lyer-muted'],
  ['text-slate-400', 'text-lyer-muted'],
  ['text-white', 'text-lyer-fg'],
];

const recorrer = (dir) => {
  for (const nombre of fs.readdirSync(dir)) {
    const ruta = path.join(dir, nombre);
    const st = fs.statSync(ruta);
    if (st.isDirectory()) {
      recorrer(ruta);
      continue;
    }
    if (!/\.(vue|js|css)$/.test(nombre)) continue;
    if (ruta.includes(omitir)) continue;
    let texto = fs.readFileSync(ruta, 'utf8');
    const antes = texto;
    for (const [de, a] of pares) texto = texto.split(de).join(a);
    if (texto !== antes) fs.writeFileSync(ruta, texto);
  }
};

recorrer(raiz);
console.log('Tokens de tema aplicados.');
