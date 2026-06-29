const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const db = require('../src/db');
const Order = require('../src/models/orderModel');
const paymeController = require('../src/controllers/paymeController');

// Helper to create mock response object
function createMockResponse(callback) {
    return {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.jsonData = data;
            callback(this.statusCode, data);
        }
    };
}

async function runTests() {
    console.log("=== STARTING PAYME RPC TESTS ===");

    // 1. Create a test order
    console.log("Creating test order...");
    const testOrder = await Order.create({
        client_id: 1, // Assumes user with ID 1 exists
        item_name: "Test Autopart",
        car_info: "BMW M5 2022",
        price: 150000.00, // 150,000 UZS
        status: "offer_selected",
        category: "parts"
    });
    console.log(`Test order created with ID: ${testOrder.id}`);

    const paymeKey = process.env.PAYME_KEY || "test_key";
    process.env.PAYME_KEY = paymeKey; // Ensure key is set
    const authHeader = "Basic " + Buffer.from(`payme:${paymeKey}`).toString('base64');

    const txId = "507f1f77bcf86cd799439011"; // Mock 24-character hex ID

    try {
        // --- TEST 1: CheckPerformTransaction (Success) ---
        console.log("\n[Test 1] CheckPerformTransaction with correct amount...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CheckPerformTransaction",
                    params: {
                        amount: 15000000, // 150,000 UZS in tiyins
                        account: { order_id: String(testOrder.id) }
                    },
                    id: 1
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.result && data.result.allow === true) {
                    console.log("SUCCESS: CheckPerformTransaction allowed payment.");
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 2: CheckPerformTransaction (Amount mismatch) ---
        console.log("\n[Test 2] CheckPerformTransaction with incorrect amount...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CheckPerformTransaction",
                    params: {
                        amount: 10000000, // incorrect
                        account: { order_id: String(testOrder.id) }
                    },
                    id: 2
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.error && data.error.code === -31001) {
                    console.log("SUCCESS: Correctly returned error -31001 for amount mismatch.");
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 3: CreateTransaction (Success) ---
        console.log("\n[Test 3] CreateTransaction...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CreateTransaction",
                    params: {
                        id: txId,
                        time: Date.now(),
                        amount: 15000000,
                        account: { order_id: String(testOrder.id) }
                    },
                    id: 3
                }
            };
            const res = createMockResponse(async (status, data) => {
                if (status === 200 && data.result && data.result.state === 1) {
                    console.log("SUCCESS: CreateTransaction completed.");
                    // Check database status for order
                    const updatedOrder = await Order.getById(testOrder.id);
                    if (updatedOrder.status === 'waiting_payment') {
                        console.log("SUCCESS: Order status transitioned to 'waiting_payment'.");
                        resolve();
                    } else {
                        reject(new Error(`FAILED: Order status is ${updatedOrder.status}, expected 'waiting_payment'`));
                    }
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 4: CreateTransaction (Duplicate - returns existing) ---
        console.log("\n[Test 4] CreateTransaction duplicate check...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CreateTransaction",
                    params: {
                        id: txId,
                        time: Date.now(),
                        amount: 15000000,
                        account: { order_id: String(testOrder.id) }
                    },
                    id: 4
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.result && data.result.transaction === txId) {
                    console.log("SUCCESS: Correctly returned existing transaction.");
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 5: PerformTransaction (Success) ---
        console.log("\n[Test 5] PerformTransaction...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "PerformTransaction",
                    params: { id: txId },
                    id: 5
                }
            };
            const res = createMockResponse(async (status, data) => {
                if (status === 200 && data.result && data.result.state === 2) {
                    console.log("SUCCESS: PerformTransaction completed.");
                    const updatedOrder = await Order.getById(testOrder.id);
                    if (updatedOrder.status === 'paid_product') {
                        console.log("SUCCESS: Order status transitioned to 'paid_product'.");
                        resolve();
                    } else {
                        reject(new Error(`FAILED: Order status is ${updatedOrder.status}, expected 'paid_product'`));
                    }
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 6: CheckTransaction ---
        console.log("\n[Test 6] CheckTransaction...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CheckTransaction",
                    params: { id: txId },
                    id: 6
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.result && data.result.state === 2) {
                    console.log("SUCCESS: CheckTransaction returned state 2.");
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 7: CancelTransaction (Failed - shipped check) ---
        console.log("\n[Test 7] CancelTransaction for shipped order (should fail)...");
        // Update order status to shipped_by_seller
        await Order.update(testOrder.id, { status: "shipped_by_seller" });
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CancelTransaction",
                    params: { id: txId, reason: 1 },
                    id: 7
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.error && data.error.code === -31007) {
                    console.log("SUCCESS: Correctly blocked cancellation of shipped product with -31007.");
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 8: CancelTransaction (Success) ---
        console.log("\n[Test 8] CancelTransaction (Success)...");
        // Revert status to paid_product so it can be cancelled
        await Order.update(testOrder.id, { status: "paid_product" });
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "CancelTransaction",
                    params: { id: txId, reason: 1 },
                    id: 8
                }
            };
            const res = createMockResponse(async (status, data) => {
                if (status === 200 && data.result && data.result.state === -2) {
                    console.log("SUCCESS: CancelTransaction completed.");
                    const updatedOrder = await Order.getById(testOrder.id);
                    if (updatedOrder.status === 'cancelled') {
                        console.log("SUCCESS: Order status transitioned to 'cancelled'.");
                        resolve();
                    } else {
                        reject(new Error(`FAILED: Order status is ${updatedOrder.status}, expected 'cancelled'`));
                    }
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        // --- TEST 9: GetStatement ---
        console.log("\n[Test 9] GetStatement...");
        await new Promise((resolve, reject) => {
            const req = {
                headers: { authorization: authHeader },
                body: {
                    jsonrpc: "2.0",
                    method: "GetStatement",
                    params: {
                        from: Date.now() - 3600000, // 1 hour ago
                        to: Date.now() + 3600000    // 1 hour later
                    },
                    id: 9
                }
            };
            const res = createMockResponse((status, data) => {
                if (status === 200 && data.result && Array.isArray(data.result.transactions)) {
                    console.log(`SUCCESS: GetStatement returned ${data.result.transactions.length} transactions.`);
                    resolve();
                } else {
                    reject(new Error(`FAILED: Status ${status}, Data: ${JSON.stringify(data)}`));
                }
            });
            paymeController.handleBilling(req, res).catch(reject);
        });

        console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");

    } catch (err) {
        console.error("\n!!! TEST SUITE FAILED !!!");
        console.error(err);
    } finally {
        // Cleanup database
        console.log("\nCleaning up database...");
        try {
            await db.query("DELETE FROM payme_transactions WHERE id = $1", [txId]);
            await db.query("DELETE FROM orders WHERE id = $1", [testOrder.id]);
            console.log("Database cleaned up successfully.");
        } catch (cleanupErr) {
            console.error("Cleanup failed:", cleanupErr);
        }
        process.exit(0);
    }
}

runTests();
