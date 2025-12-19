
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const currencies = await prisma.currency.findMany();
    console.log(JSON.stringify(currencies, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
