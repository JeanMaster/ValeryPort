
const BASE_URL = 'http://localhost:3000/api';

async function request(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${method} ${path} ${res.status} - ${text}`);
    }
    try {
        return await res.json();
    } catch {
        return null; // Empty response (204)
    }
}

async function runTest() {
    console.log('=== STARTING E2E POS CYCLE TEST ===');

    try {
        // 1. Get Main Register
        console.log('\n[1] Getting Cash Register...');
        const register = await request('GET', '/cash-register/registers/main');
        console.log(`    > Register ID: ${register.id} (${register.name})`);

        // 2. Check Active Session
        console.log('\n[2] Checking Active Session...');
        let session = await request('GET', `/cash-register/sessions/active?registerId=${register.id}`).catch(() => null);

        // Note: The backend route prefix might be /api or / (backend logs show mapped to /api usually in standard NestJS setups, checking...)
        // Checking task.md or previous files implies '/api' might be handled by frontend proxy or global prefix.
        // Let's assume root path based on previous `test_invoice_flow.js` which used `http://localhost:3000/invoice/next`.
        // So no /api prefix unless added global.

        if (!session) {
            console.log('    > No active session. Opening new session...');
            console.log('    > No active session. Opening new session...');
            session = await request('POST', '/cash-register/sessions/open', {
                registerId: register.id,
                openingBalance: 100
            });
            console.log(`    > Session Opened: ${session.id}`);
        } else {
            console.log(`    > Active Session Found: ${session.id}`);
        }

        // 3. Get Currencies to find USD
        console.log('\n[3] Fetching Currencies...');
        const currencies = await request('GET', '/currencies');
        let usdDiff = currencies.find(c => c.code === 'USD');
        const vesDiff = currencies.find(c => c.code === 'VES');

        if (!usdDiff) {
            console.log('    > USD not found. Creating it...');
            usdDiff = await request('POST', '/currencies', {
                name: 'Dolares',
                code: 'USD',
                symbol: '$',
                isPrimary: false,
                exchangeRate: 50
            });
            console.log(`    > USD Created: ${usdDiff.id}`);
        }

        if (!vesDiff) {
            console.log('    > VES not found! This is critical. Assuming ID 1 or auto-created...');
            // Not creating VES for now as it *should* exist.
        }
        console.log(`    > USD ID: ${usdDiff.id}, Rate: ${usdDiff.exchangeRate}`);

        // 4. Create Test Product
        console.log('\n[4] Creating Test Product...');
        const uniqueSuffix = Date.now().toString().slice(-4);
        const productData = {
            sku: `TEST-${uniqueSuffix}`,
            name: `E2E Test Product ${uniqueSuffix}`,
            description: 'Created by automation',
            salePrice: 100, // Base Price VES
            costPrice: 50,  // Base Cost VES
            stock: 10,
            categoryId: (await request('GET', '/departments'))[0]?.id, // Get first department as category
            unitId: (await request('GET', '/units'))[0]?.id, // Get first unit
            currencyId: vesDiff.id
        };
        // Need to check specific DTO for create product. Assuming standard.
        // We might fail if categories empty.

        // Let's create category if needed or just fetch.
        // Let's create category if needed or just fetch.
        const cats = await request('GET', '/departments');
        if (cats.length === 0) {
            console.log('    > No departments found. Creating one...');
            const newDept = await request('POST', '/departments', { name: `Dept ${uniqueSuffix}`, description: 'Auto' });
            productData.categoryId = newDept.id;
        } else {
            productData.categoryId = cats[0].id;
        }

        const units = await request('GET', '/units');
        if (units.length === 0) throw new Error("No units found");
        productData.unitId = units[0].id;

        const product = await request('POST', '/products', productData);
        console.log(`    > Product Created: ${product.name} (ID: ${product.id})`);
        console.log(`    > Initial Stock: ${product.stock}`);
        console.log(`    > Initial Cost: ${product.costPrice} ${product.currency?.code || 'VES'}`);

        // 5. Purchase Product in USD
        console.log('\n[5] Purchasing Product in USD...');
        // Need a supplier
        const suppliers = await request('GET', '/suppliers');
        let supplierId = suppliers[0]?.id;
        if (!supplierId) {
            const newSup = await request('POST', '/suppliers', {
                comercialName: 'Test Supplier', rif: `J-9999${uniqueSuffix}`
            });
            supplierId = newSup.id;
        }

        const purchaseData = {
            supplierId: supplierId,
            invoiceNumber: `INV-${uniqueSuffix}`,
            invoiceDate: new Date().toISOString(),
            currencyCode: 'USD',
            exchangeRate: 50, // Custom rate for this purchase (example)
            items: [
                {
                    productId: product.id,
                    quantity: 10,
                    cost: 5 // 5 USD cost
                }
            ]
        };

        const purchase = await request('POST', '/purchases', purchaseData);
        console.log(`    > Purchase Created: ID ${purchase.id}`);

        // 6. Verify Product Update
        console.log('\n[6] Verifying Product Update (Cost & Currency)...');
        const updatedProduct = await request('GET', `/products/${product.id}`);

        console.log(`    > New Stock: ${updatedProduct.stock} (Expected 20: 10 initial + 10 purchased)`);
        console.log(`    > New Cost: ${updatedProduct.costPrice} (Expected 5)`);
        console.log(`    > New Currency: ${updatedProduct.currencyId} (Expected ${usdDiff.id} for USD)`);

        if (updatedProduct.costPrice !== 5 || updatedProduct.currencyId !== usdDiff.id) {
            console.error('    FAIL: Product cost/currency did not update correctly!');
        } else {
            console.log('    SUCCESS: Product cost/currency updated correctly.');
        }

        // 7. Perform Sale (POS)
        console.log('\n[7] Performing POS Sale...');
        // Create Sale
        const saleData = {
            clientId: null,
            items: [
                {
                    productId: product.id,
                    quantity: 2,
                    unitPrice: 250,
                    total: 500
                }
            ],
            subtotal: 500,
            discount: 0,
            tax: 0, // Assuming tax included or 0 for test simplicity
            total: 500,
            paymentMethod: 'CASH',
            tendered: 500,
            change: 0
        };

        const sale = await request('POST', '/sales', saleData);
        console.log(`    > Sale Created: ${sale.invoiceNumber}`);

        // 8. Verify Final State
        console.log('\n[8] Verifying Final State...');
        const finalProduct = await request('GET', `/products/${product.id}`);
        console.log(`    > Final Stock: ${finalProduct.stock} (Expected 18: 20 - 2)`);

        const updatedSession = await request('GET', `/cash-register/sessions/active?registerId=${register.id}`);
        // We expect cash increment.
        // Assuming we started with 100. Added 500 sale.
        // Need to check movements or current balance if exposed.
        // The endpoint usually returns session with movements.
        const saleMovement = updatedSession.movements.find(m => m.type === 'SALE' && Number(m.amount) === 500);
        if (saleMovement) {
            console.log('    SUCCESS: Cash Movement found for 500 VES.');
        } else {
            console.error('    FAIL: Cash Movement NOT found.');
        }

        console.log('\n=== E2E TEST COMPLETED ===');

    } catch (e) {
        console.error('\n!!! TEST FAILED !!!');
        console.error(e.message);
    }
}

runTest();
