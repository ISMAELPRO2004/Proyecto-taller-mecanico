import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const usuarios = [
    { username: 'admin', nombreCompleto: 'Administrador Sistema', rol: 'ADMIN' },
    { username: 'supervisor', nombreCompleto: 'Supervisor Taller', rol: 'SUPERVISOR' },
    { username: 'tecnico', nombreCompleto: 'Técnico Taller', rol: 'TECNICO' },
    { username: 'recepcion', nombreCompleto: 'Recepcionista', rol: 'RECEPCIONISTA' },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { username: u.username },
      update: {
        nombreCompleto: u.nombreCompleto,
        rol: u.rol,
        password,
        activo: true,
      },
      create: {
        username: u.username,
        password,
        nombreCompleto: u.nombreCompleto,
        rol: u.rol,
        activo: true,
      },
    });
  }

  const marcas = ['Toyota', 'Nissan', 'Hyundai', 'Kia', 'Chevrolet', 'Genérica'];
  for (const nombre of marcas) {
    await prisma.marcaVehiculo.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log('✅ Seed OK. Usuarios: admin / supervisor / tecnico / recepcion (pass: admin123)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
