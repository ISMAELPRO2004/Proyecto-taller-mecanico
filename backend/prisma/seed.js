import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const passwordHasheada = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      username: 'admin',
      password: passwordHasheada,
      nombreCompleto: 'Administrador Inicial',
      rol: 'ADMIN',
    },
  });

  console.log('✅ Conexión exitosa. Usuario admin creado/verificado:', admin.username);
}

main()
  .catch((e) => {
    console.error('❌ Error en la conexión:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });