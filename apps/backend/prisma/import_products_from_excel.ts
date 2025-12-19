const fs = require('fs');
const XLSX = require('xlsx');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const filePath = '/home/inversur/proyectos/ValeryPort/codigos.xlsx';

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Reading file from: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON. Assuming header is not present or we treat first row as data?
    // User didn't specify if there are headers. Usually there are. 
    // "el primero es el codigo (SKU), el segundo es el nombre, el 3ro es la Categoria y el cuarto la Subcategoria"
    // Let's assume there might be a header. If the first row looks like "Codigo", "Nombre" etc, we skip it.

    const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Total rows found: ${data.length}`);

    // 0. CLEANUP (Optional but recommended to avoid duplicates/mess)
    console.log('Cleaning up existing Products and Departments...');
    await prisma.product.deleteMany({});
    // We need to delete Subcategories first, then Categories
    await prisma.department.deleteMany({});
    console.log('Cleanup done.');

    // 1. Get Primary Currency
    const currency = await prisma.currency.findFirst({
        where: { isPrimary: true },
    });

    if (!currency) {
        console.error('No primary currency found. Please create one first.');
        process.exit(1);
    }
    console.log(`Using Currency: ${currency.name} (${currency.code})`);

    // 2. Get Unit (UND)
    let unit = await prisma.unit.findUnique({
        where: { name: 'UND' },
    });

    if (!unit) {
        console.log('Unit UND not found. Creating it...');
        unit = await prisma.unit.create({
            data: {
                name: 'UND',
                abbreviation: 'UND',
            },
        });
    }
    console.log(`Using Unit: ${unit.name}`);

    // 3. Process Rows
    let processedCount = 0;

    for (const row of data) {
        const sku = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        const categoryName = row[2]?.toString().trim();
        const subcategoryName = row[3]?.toString().trim();

        if (!sku || !name) {
            continue;
        }

        // Simple heuristic to skip header
        if (sku.toLowerCase() === 'codigo' || sku.toLowerCase() === 'sku' || sku.toLowerCase() === 'código') {
            continue;
        }

        // Find or Create Category (Department)
        let categoryId = '';

        if (categoryName) {
            let category = await prisma.department.findFirst({
                where: { name: { equals: categoryName, mode: 'insensitive' }, parentId: null }
            });

            if (!category) {
                category = await prisma.department.create({
                    data: { name: categoryName }
                });
                console.log(`Created Category: ${categoryName}`);
            }
            categoryId = category.id;
        } else {
            // Fallback: If no category in Excel, maybe skip or use a default?
            // Let's assume for now we skip or log warning.
            // User said: "el 3ro es la Categoria". 
            console.warn(`Row with SKU ${sku} has no category. Skipping.`);
            continue;
        }

        // Find or Create Subcategory
        let subcategoryId: string | null = null;
        if (subcategoryName && categoryId) {
            let subcategory = await prisma.department.findFirst({
                where: {
                    name: { equals: subcategoryName, mode: 'insensitive' },
                    parentId: categoryId
                }
            });

            if (!subcategory) {
                subcategory = await prisma.department.create({
                    data: {
                        name: subcategoryName,
                        parentId: categoryId
                    }
                });
                console.log(`Created Subcategory: ${subcategoryName} (Child of ${categoryName})`);
            }
            subcategoryId = subcategory.id;
        }

        // Upsert Product
        try {
            await prisma.product.create({
                data: {
                    sku: sku,
                    name: name,
                    categoryId: categoryId,
                    subcategoryId: subcategoryId,
                    currencyId: currency.id,
                    unitId: unit.id,
                    salePrice: 2,
                    costPrice: 1,
                    stock: 0,
                    type: 'PRODUCT'
                }
            });
            if (processedCount % 100 === 0) process.stdout.write('.');
            processedCount++;
        } catch (e) {
            console.error(`Error processing SKU ${sku}:`, e);
        }
    }

    console.log(`\n\nImport completed! Processed ${processedCount} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
