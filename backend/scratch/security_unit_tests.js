const path = require('path');
const assert = require('assert');

// Load env variables if they exist
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Mock db.query before loading models
const db = require('../src/db');
const queries = [];
db.query = async (queryText, params) => {
    queries.push({ queryText, params });
    // Mock user select return
    if (queryText.includes('FROM users')) {
        return {
            rows: [{
                id: 1,
                phone: '123456789',
                name: 'Test User',
                role: 'admin',
                allowed_brands: ['BMW'],
                allowed_categories: ['parts'],
                logistics_type: null
            }]
        };
    }
    // Default mock row
    return { rows: [{ id: 42, is_approved: true }] };
};

const Product = require('../src/models/productModel');
const Order = require('../src/models/orderModel');
const fileUpload = require('../src/utils/fileUpload');
const authMiddleware = require('../src/middleware/authMiddleware');

async function testSQLInjectionPrevention() {
    console.log('\n--- Testing SQL Injection Prevention in Models ---');
    queries.length = 0; // Clear query log

    // 1. Test Product.update with whitelisted and malicious keys
    const maliciousProductData = {
        name: 'Valid Name',
        price: 100,
        'price = $3; DROP TABLE products; --': 'injected'
    };
    
    await Product.update(1, maliciousProductData);
    
    assert.strictEqual(queries.length, 1);
    const prodQuery = queries[0].queryText;
    console.log('Product Update SQL generated:', prodQuery);
    
    // Check that it includes name and price but NOT the injected key
    assert.ok(prodQuery.includes('"name" = $2'));
    assert.ok(prodQuery.includes('"price" = $3'));
    assert.ok(!prodQuery.includes('DROP TABLE'));
    assert.ok(!prodQuery.includes('injected'));
    console.log('✅ Product.update correctly stripped malicious columns.');

    queries.length = 0; // Clear query log

    // 2. Test Order.update with whitelisted and malicious keys
    const maliciousOrderData = {
        status: 'paid_product',
        'status = $3; DROP TABLE orders; --': 'injected'
    };

    await Order.update(1, maliciousOrderData);
    
    assert.strictEqual(queries.length, 1);
    const orderQuery = queries[0].queryText;
    console.log('Order Update SQL generated:', orderQuery);

    assert.ok(orderQuery.includes('"status" = $2'));
    assert.ok(!orderQuery.includes('DROP TABLE'));
    assert.ok(!orderQuery.includes('injected'));
    console.log('✅ Order.update correctly stripped malicious columns.');
}

function testFileUploadValidation() {
    console.log('\n--- Testing File Upload Extension Validation ---');

    // Mock callback function for multer fileFilter
    let filterResult = null;
    let filterError = null;
    const cb = (err, result) => {
        filterError = err;
        filterResult = result;
    };

    const filterFunc = fileUpload.fileFilter;

    // 1. Valid case
    filterFunc(null, { originalname: 'image.png', mimetype: 'image/png' }, cb);
    assert.strictEqual(filterError, null);
    assert.strictEqual(filterResult, true);
    console.log('✅ Allowed valid png image upload.');

    // 2. Spoofed Content-Type case (Stored XSS)
    filterFunc(null, { originalname: 'exploit.html', mimetype: 'image/jpeg' }, cb);
    assert.ok(filterError instanceof Error);
    assert.strictEqual(filterResult, false);
    console.log('✅ Correctly blocked spoofed html file with image mimetype.');

    // 3. Invalid extension case
    filterFunc(null, { originalname: 'exploit.exe', mimetype: 'image/png' }, cb);
    assert.ok(filterError instanceof Error);
    console.log('✅ Correctly blocked executables.');
}

async function testAuthMiddlewareDatabaseChecks() {
    console.log('\n--- Testing Auth Middleware DB Presence & Role Sync ---');
    queries.length = 0; // Clear query log

    const jwt = require('jsonwebtoken');
    process.env.JWT_SECRET = 'test_secret';

    const testToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    
    const req = {
        headers: {
            authorization: `Bearer ${testToken}`
        }
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
        nextCalled = true;
        nextError = err;
    };

    await authMiddleware.protect(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(nextError, undefined);
    
    // Verify that req.user contains database values (like role 'admin' and allowed_brands), not just JWT token values
    assert.strictEqual(req.user.id, 1);
    assert.strictEqual(req.user.role, 'admin');
    assert.deepStrictEqual(req.user.allowed_brands, ['BMW']);
    
    // Verify database select query was executed
    assert.ok(queries.some(q => q.queryText.includes('SELECT') && q.queryText.includes('users')));
    console.log('✅ Auth middleware verified token owner in DB and loaded current roles.');
}

async function runAll() {
    try {
        await testSQLInjectionPrevention();
        testFileUploadValidation();
        await testAuthMiddlewareDatabaseChecks();
        console.log('\n🎉 ALL SECURITY UNIT TESTS PASSED SUCCESSFULLY! 🎉\n');
    } catch (err) {
        console.error('❌ Test execution failed:', err);
        process.exit(1);
    }
}

runAll();
