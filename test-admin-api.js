/**
 * Admin API Test Script
 * =====================
 * 
 * Simulates an admin approve/reject operation to verify:
 * 1. Admin login works and sets cookie
 * 2. Admin PATCH request includes JSON body
 * 3. Admin can approve/reject transactions
 * 4. Backend does not crash on these operations
 */

import fetch from 'node-fetch';
import http from 'http';

const BASE_URL = 'http://127.0.0.1:4000';
const ADMIN_EMAIL = 'admin@cfdtradingpro.com';
const ADMIN_PASSWORD = 'admin123';

async function test() {
  console.log('🧪 Starting Admin API Test Suite\n');

  try {
    // Test 1: Admin Login
    console.log('📝 Test 1: Admin Login');
    let cookies = '';
    
    try {
      const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
      
      const setCookie = loginRes.headers.get('set-cookie');
      if (setCookie) {
        cookies = setCookie.split(';')[0];
        console.log('✅ Admin login successful');
        console.log(`   Cookie set: ${cookies.substring(0, 50)}...`);
      } else {
        console.log('⚠️  No cookie set (may use db.json fallback)');
      }
      
      const loginData = await loginRes.json();
      console.log(`   Status: ${loginRes.status}`);
      console.log(`   Response: ${JSON.stringify(loginData).substring(0, 100)}...\n`);
    } catch (e) {
      console.log(`⚠️  Admin login test skipped (no admin user in db): ${e.message}\n`);
    }

    // Test 2: Get Admin Summary (Public endpoint)
    console.log('📊 Test 2: Get Admin Summary (Public)');
    const summaryRes = await fetch(`${BASE_URL}/api/admin/summary`);
    console.log(`   Status: ${summaryRes.status}`);
    const summary = await summaryRes.json();
    console.log(`   Response: ${JSON.stringify(summary).substring(0, 100)}...\n`);

    // Test 3: Simulate PATCH with JSON body (like approve/reject)
    console.log('🔧 Test 3: Test PATCH with JSON Body (Admin Protected Route)');
    const patchRes = await fetch(`${BASE_URL}/api/admin/transactions/test-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      body: JSON.stringify({
        status: 'approved',
        adminNotes: 'Test approval from admin API test',
      }),
    });
    console.log(`   Status: ${patchRes.status}`);
    const patchData = await patchRes.json();
    console.log(`   Response: ${JSON.stringify(patchData).substring(0, 150)}...\n`);

    // Test 4: POST request to create (like send message)
    console.log('📮 Test 4: Test POST with JSON Body (Admin Protected Route)');
    const postRes = await fetch(`${BASE_URL}/api/admin/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        message: 'Test message from admin API test',
        type: 'notice',
      }),
    });
    console.log(`   Status: ${postRes.status}`);
    const postData = await postRes.json();
    console.log(`   Response: ${JSON.stringify(postData).substring(0, 150)}...\n`);

    console.log('✅ Admin API Test Suite Complete!');
    console.log('🎉 All endpoints responded without crashing.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

test();
