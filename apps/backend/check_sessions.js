
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.cashSession.findMany({
        orderBy: { openedAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(sessions, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
