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

  const marcasDb = Object.fromEntries(
    (await prisma.marcaVehiculo.findMany()).map((m) => [m.nombre, m.id])
  );

  const clientes = [
    {
      tipoCliente: 'PERSONA',
      tipoDocumento: 'DNI',
      numeroDocumento: '45678912',
      nombreRazonSocial: 'Juan Pérez Quispe',
      celular: '987654321',
      correo: 'juan.perez@gmail.com',
    },
    {
      tipoCliente: 'PERSONA',
      tipoDocumento: 'DNI',
      numeroDocumento: '40123456',
      nombreRazonSocial: 'María Huamán Condori',
      celular: '956112233',
      correo: 'maria.huaman@gmail.com',
    },
    {
      tipoCliente: 'PERSONA',
      tipoDocumento: 'DNI',
      numeroDocumento: '72345678',
      nombreRazonSocial: 'Carlos Mendoza Rojas',
      celular: '964778899',
      correo: 'carlos.mendoza@gmail.com',
    },
    {
      tipoCliente: 'EMPRESA',
      tipoDocumento: 'RUC',
      numeroDocumento: '20601234567',
      nombreRazonSocial: 'Transportes Andinos SAC',
      representante: 'Luis Campos Yupanqui',
      celular: '964001122',
      correo: 'ventas@transportesandinos.pe',
    },
    {
      tipoCliente: 'EMPRESA',
      tipoDocumento: 'RUC',
      numeroDocumento: '20509876543',
      nombreRazonSocial: 'Constructora Valle Verde EIRL',
      representante: 'Rosa Quispe Huamán',
      celular: '955334455',
      correo: 'taller@valleverde.pe',
    },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { numeroDocumento: cliente.numeroDocumento },
      update: cliente,
      create: cliente,
    });
  }

  const vehiculos = [
    { placa: 'T4K-392', marca: 'Toyota', modelo: 'Hilux', kilometraje: 84500, horometro: 0 },
    { placa: 'B8F-2145', marca: 'Nissan', modelo: 'Frontier', kilometraje: 120300, horometro: 0 },
    { placa: 'P3H-881', marca: 'Hyundai', modelo: 'Tucson', kilometraje: 45200, horometro: 0 },
    { placa: 'A7C-450', marca: 'Kia', modelo: 'Sportage', kilometraje: 31800, horometro: 0 },
    { placa: 'H2M-1908', marca: 'Chevrolet', modelo: 'N300', kilometraje: 67340, horometro: 0 },
    { placa: 'XYZ-100', marca: 'Genérica', modelo: 'Camión 4x2', kilometraje: 0, horometro: 1520 },
  ];

  for (const v of vehiculos) {
    await prisma.vehiculo.upsert({
      where: { placa: v.placa },
      update: {
        marcaId: marcasDb[v.marca],
        modelo: v.modelo,
        kilometraje: v.kilometraje,
        horometro: v.horometro,
      },
      create: {
        placa: v.placa,
        marcaId: marcasDb[v.marca],
        modelo: v.modelo,
        kilometraje: v.kilometraje,
        horometro: v.horometro,
      },
    });
  }

  const materiales = [
    { descripcion: 'Aceite 15W40 galón', precioBase: 85 },
    { descripcion: 'Filtro de aceite', precioBase: 28 },
    { descripcion: 'Filtro de aire', precioBase: 35 },
    { descripcion: 'Filtro de combustible', precioBase: 42 },
    { descripcion: 'Pastillas de freno delanteras', precioBase: 120 },
    { descripcion: 'Balatas traseras', precioBase: 95 },
    { descripcion: 'Bujía', precioBase: 18 },
    { descripcion: 'Refrigerante litro', precioBase: 22 },
    { descripcion: 'Líquido de frenos', precioBase: 30 },
    { descripcion: 'Correa de distribución', precioBase: 180 },
  ];

  for (const material of materiales) {
    const existe = await prisma.catalogoMaterial.findFirst({
      where: { descripcion: material.descripcion },
    });
    if (existe) {
      await prisma.catalogoMaterial.update({
        where: { id: existe.id },
        data: { precioBase: material.precioBase },
      });
    } else {
      await prisma.catalogoMaterial.create({ data: material });
    }
  }

  const servicios = [
    { descripcion: 'Cambio de aceite', precioBase: 40 },
    { descripcion: 'Diagnóstico de motor', precioBase: 80 },
    { descripcion: 'Alineamiento y balanceo', precioBase: 70 },
    { descripcion: 'Mano de obra frenos', precioBase: 90 },
  ];

  for (const servicio of servicios) {
    const existe = await prisma.catalogoServicio.findFirst({
      where: { descripcion: servicio.descripcion },
    });
    if (existe) {
      await prisma.catalogoServicio.update({
        where: { id: existe.id },
        data: { precioBase: servicio.precioBase },
      });
    } else {
      await prisma.catalogoServicio.create({ data: servicio });
    }
  }

  const terceros = [
    { descripcion: 'Rectificado de motor', responsable: 'Rectificadora El Sol', precioBase: 450 },
    { descripcion: 'Soldadura de chasis', responsable: 'Soldaduras Huancayo', precioBase: 180 },
    { descripcion: 'Pintura de guardafango', responsable: 'Pinturas Andinas', precioBase: 220 },
  ];

  for (const tercero of terceros) {
    const existe = await prisma.catalogoTercero.findFirst({
      where: { descripcion: tercero.descripcion },
    });
    if (existe) {
      await prisma.catalogoTercero.update({
        where: { id: existe.id },
        data: { precioBase: tercero.precioBase, responsable: tercero.responsable },
      });
    } else {
      await prisma.catalogoTercero.create({ data: tercero });
    }
  }

  console.log('✅ Seed OK. Usuarios: admin / supervisor / tecnico / recepcion (pass: admin123)');
  console.log('   Clientes: Juan Pérez, María Huamán, Carlos Mendoza, Transportes Andinos, Valle Verde');
  console.log('   Placas: T4K-392, B8F-2145, P3H-881, A7C-450, H2M-1908, XYZ-100');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
