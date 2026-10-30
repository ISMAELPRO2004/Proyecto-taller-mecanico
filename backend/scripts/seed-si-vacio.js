import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from '../src/config/prisma.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const n = await prisma.usuario.count();
await prisma.$disconnect();

if (n > 0) {
  console.log('Seed omitido: la base ya tiene usuarios');
  process.exit(0);
}

const hijo = spawn(process.execPath, [path.join(raiz, 'prisma', 'seed.js')], {
  stdio: 'inherit',
  cwd: raiz,
  env: process.env,
});

hijo.on('exit', (code) => process.exit(code ?? 1));
hijo.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
