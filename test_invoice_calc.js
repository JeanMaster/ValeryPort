// Quick test to verify invoice number fetching
import { salesApi } from './apps/frontend/src/services/salesApi.ts';

async function testInvoiceLogic() {
    console.log('=== Testing Invoice Number Logic ===\n');

    try {
        // Test 1: Get all sales
        const sales = await salesApi.getAll();
        console.log('Total sales:', sales.length);

        if (sales.length > 0) {
            // Show first few invoices
            console.log('\nFirst 5 invoices:');
            sales.slice(0, 5).forEach(sale => {
                console.log(`  - ${sale.invoiceNumber} (${new Date(sale.date).toLocaleDateString()})`);
            });

            // Sort and find last
            const sortedSales = [...sales].sort((a, b) => {
                return b.invoiceNumber.localeCompare(a.invoiceNumber);
            });

            const lastInvoice = sortedSales[0].invoiceNumber;
            console.log('\nLast invoice:', lastInvoice);

            // Calculate next
            const match = lastInvoice.match(/([A-Z]+)-(\d+)$/);
            if (match) {
                const prefix = match[1];
                const lastNumber = parseInt(match[2], 10);
                const nextNumber = lastNumber + 1;
                const nextInvoice = `${prefix}-${nextNumber.toString().padStart(8, '0')}`;
                console.log('Next invoice should be:', nextInvoice);
            }
        } else {
            console.log('No sales found - would show: FAC-00000001');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testInvoiceLogic();
