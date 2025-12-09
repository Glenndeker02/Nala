/**
 * Authentication Flow Test Script
 * Run this in the browser console to test the complete auth flow
 */

async function testAuthFlow() {
    console.log('=== AUTHENTICATION FLOW TEST ===\n');

    // Step 1: Login
    console.log('Step 1: Testing login...');
    const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'mike21@gmail.com',  // Change to your founder email
            password: 'password123'      // Change to your password
        })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (!loginResponse.ok) {
        console.error('❌ Login failed:', loginData.error);
        return;
    }

    // Step 2: Check token structure
    console.log('\nStep 2: Checking token structure...');
    const token = loginData.data?.accessToken;
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    console.log('Token preview:', token?.substring(0, 50) + '...');

    if (!token) {
        console.error('❌ No accessToken in response!');
        console.log('Response structure:', JSON.stringify(loginData, null, 2));
        return;
    }

    // Step 3: Test auth endpoint
    console.log('\nStep 3: Testing /api/test-auth...');
    const testAuthResponse = await fetch('/api/test-auth', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const testAuthData = await testAuthResponse.json();
    console.log('Test Auth Response:', testAuthData);

    if (!testAuthResponse.ok) {
        console.error('❌ Test auth failed:', testAuthData.error);
        return;
    }

    console.log('✅ Test auth succeeded!');

    // Step 4: Test campaign creation endpoint
    console.log('\nStep 4: Testing /api/campaigns/create...');
    const campaignResponse = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Test Campaign',
            description: 'Testing authentication',
            videosRequested: 1,
            totalBudget: 500,
            baseFeePerVideo: 100,
            postingFrequency: 'daily'
        })
    });

    const campaignData = await campaignResponse.json();
    console.log('Campaign Response:', campaignData);

    if (!campaignResponse.ok) {
        console.error('❌ Campaign creation failed:', campaignData.error);
        return;
    }

    console.log('✅ Campaign creation succeeded!');
    console.log('\n=== ALL TESTS PASSED ===');
}

// Run the test
testAuthFlow().catch(console.error);
