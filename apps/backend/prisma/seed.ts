
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminExists = await (prisma as any).user.findUnique({
        where: { username: 'admin' },
    });

    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await (prisma as any).user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                name: 'Administrador Sistema',
                role: 'ADMIN',
                permissions: [],
            },
        });
        console.log('✅ Default admin user created (admin/admin123)');
    } else {
        console.log('ℹ️ Admin user already exists');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
