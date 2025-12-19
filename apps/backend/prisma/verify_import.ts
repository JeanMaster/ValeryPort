
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const departments = await prisma.department.findMany();
    console.log('--- Departments Created ---');
    departments.forEach(d => {
        if (!d.parentId) console.log(`[Category] ${d.name}`);
        else console.log(`  -> [Sub] ${d.name}`);
    });

    const productCount = await prisma.product.count();
    console.log(`\nTotal Products: ${productCount}`);

    const sampleProduct = await prisma.product.findFirst({
        include: { category: true, subcategory: true }
    });
    if (sampleProduct) {
        console.log(`\nSample Product: ${sampleProduct.name}`);
        console.log(`Category: ${sampleProduct.category.name}`);
        console.log(`Subcategory: ${sampleProduct.subcategory?.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
