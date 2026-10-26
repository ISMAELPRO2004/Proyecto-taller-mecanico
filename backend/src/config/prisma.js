import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { log } from '../utils/logger.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (error) => {
  log.error('PostgreSQL: error en el pool de conexiones', error);
});

let avisoConexion = false;
pool.on('connect', () => {
  if (avisoConexion) return;
  avisoConexion = true;
  log.info('PostgreSQL: conexión lista');
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
