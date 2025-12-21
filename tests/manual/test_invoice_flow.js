// Test script to verify invoice number flow
console.log('=== Testing Invoice Number Flow ===\n');

// Test 1: Check if backend endpoint is accessible
async function testBackendEndpoint() {
    try {
        const response = await fetch('http://localhost:3000/invoice/next');
        const data = await response.json();
        console.log('✓ Backend endpoint working:', data);
        return data.invoiceNumber;
    } catch (error) {
        console.error('✗ Backend endpoint failed:', error.message);
        return null;
    }
}

// Test 2: Check invoice counter in database
async function checkDatabaseCounter() {
    try {
        const response = await fetch('http://localhost:3000/invoice/counter');
        const data = await response.json();
        console.log('✓ Database counter:', data);
        return data;
    } catch (error) {
        console.error('✗ Database query failed:', error.message);
        return null;
    }
}

// Run tests
(async () => {
    console.log('\n1. Testing Backend Endpoint...');
    const invoiceNumber = await testBackendEndpoint();

    console.log('\n2. Checking Database Counter...');
    const counter = await checkDatabaseCounter();

    console.log('\n3. Expected Behavior:');
    console.log('   - POS should show:', invoiceNumber);
    console.log('   - After sale, should show: FAC-' + String(counter?.currentNumber + 1 || '?').padStart(8, '0'));

    console.log('\n4. Frontend Integration Check:');
    console.log('   - Open browser console');
    console.log('   - Type: usePOSStore.getState().nextInvoiceNumber');
    console.log('   - Should match:', invoiceNumber);

    console.log('\n5. If mismatch, try:');
    console.log('   - Hard refresh: Ctrl+Shift+R');
    console.log('   - Clear cache and reload');
    console.log('   - Check Network tab for /invoice/next call');
})();
