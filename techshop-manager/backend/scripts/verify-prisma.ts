import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const [sites, users] = await Promise.all([
      prisma.site.count(),
      prisma.utilisateur.count(),
    ]);
    console.log('✅ Connected to Prisma Postgres');
    console.log(`   Sites    : ${sites}`);
    console.log(`   Utilisateurs : ${users}`);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
