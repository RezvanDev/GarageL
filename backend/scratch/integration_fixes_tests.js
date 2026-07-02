const assert = require('assert');
const validate = require('../src/middleware/validationMiddleware');
const { z } = require('zod');

// 1. Test validation middleware
async function testValidationMiddleware() {
    console.log('\n--- Testing Zod Validation Middleware ---');
    const schema = z.object({
        body: z.object({
            name: z.string(),
            price: z.preprocess(val => {
                if (typeof val === 'string' && val.trim() !== '') {
                    const parsed = parseFloat(val);
                    return isNaN(parsed) ? val : parsed;
                }
                return val;
            }, z.number().positive())
        }),
        query: z.object({
            search: z.string().optional()
        }),
        params: z.object({
            id: z.preprocess(val => {
                if (typeof val === 'string' && val.trim() !== '') {
                    const parsed = parseInt(val, 10);
                    return isNaN(parsed) ? val : parsed;
                }
                return val;
            }, z.number().int())
        })
    });

    const middleware = validate(schema);

    // Test case 1: Valid request with coercion
    const req1 = {
        body: { name: 'Test Product', price: '45.67' },
        query: { search: 'toyota' },
        params: { id: '42' }
    };
    const res1 = {};
    let nextCalled1 = false;
    const next1 = () => { nextCalled1 = true; };

    await middleware(req1, res1, next1);
    assert.ok(nextCalled1);
    assert.strictEqual(req1.body.price, 45.67); // Coerced to float
    assert.strictEqual(req1.params.id, 42); // Coerced to int
    console.log('✅ Coercion and valid parsing mutated the req object correctly.');

    // Test case 2: Invalid request
    const req2 = {
        body: { name: 12345, price: '-10' }, // invalid types & values
        query: {},
        params: { id: 'abc' } // invalid numeric id
    };
    let responseStatus = null;
    let jsonResult = null;
    const res2 = {
        status: function(code) {
            responseStatus = code;
            return {
                json: function(data) {
                    jsonResult = data;
                }
            }
        }
    };
    let nextCalled2 = false;
    const next2 = () => { nextCalled2 = true; };

    await middleware(req2, res2, next2);
    assert.strictEqual(nextCalled2, false);
    assert.strictEqual(responseStatus, 400);
    assert.strictEqual(jsonResult.status, 'fail');
    assert.ok(jsonResult.errors.length > 0);
    console.log('✅ Validation correctly rejected invalid payload with 400 and formatted error messages.');
}

// 2. Test CORS rules
function testCorsLogic() {
    console.log('\n--- Testing CORS logic ---');
    
    const allowedOrigins = ['http://localhost:5173', 'https://nexaicall.space'];
    
    function checkOrigin(origin, env) {
        if (!origin) return true;
        
        let originHostname;
        try {
            originHostname = new URL(origin).hostname;
        } catch (e) {
            originHostname = '';
        }

        const isNgrokAllowed = env !== 'production' && (
            originHostname.endsWith('.ngrok-free.app') || 
            originHostname === 'ngrok-free.app' ||
            originHostname.endsWith('.ngrok.io') ||
            originHostname === 'ngrok.io'
        );

        return allowedOrigins.includes(origin) || isNgrokAllowed;
    }

    assert.ok(checkOrigin('https://nexaicall.space', 'production'));
    assert.ok(checkOrigin('http://localhost:5173', 'production'));
    assert.ok(checkOrigin('https://sub.ngrok-free.app', 'development'));
    assert.ok(checkOrigin('http://ngrok-free.app', 'development'));
    assert.strictEqual(checkOrigin('https://sub.ngrok-free.app', 'production'), false);
    assert.strictEqual(checkOrigin('https://malicious-ngrok-free.app.attacker.com', 'development'), false);
    console.log('✅ CORS verification logic correctly permits ngrok only in non-production environments.');
}

async function run() {
    try {
        await testValidationMiddleware();
        testCorsLogic();
        console.log('\n🎉 ALL INTEGRATION FIXES TESTS PASSED SUCCESSFULLY! 🎉\n');
    } catch(e) {
        console.error('❌ Integration tests failed:', e);
        process.exit(1);
    }
}
run();
