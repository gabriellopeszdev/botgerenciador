import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const prisma  = new PrismaClient();
async function seedAdminUser() {
    console.log('\n── Usuários ──────────────────────────────');
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        console.log(`  ✓ ${username} já existe (role=${existing.role})`);
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { username, passwordHash, role: 'ADMIN' },
    });
    console.log(`  ✓ Admin criado: "${username}" (senha inicial: "${password}" — troque após o login)`);
}

async function main() {
    await seedAdminUser();
    console.log('\nDone.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
