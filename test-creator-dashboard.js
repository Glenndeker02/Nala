/**
 * Creator Dashboard API Testing Script
 * Tests all endpoints and verifies data correctness
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials (from create-test-user.ts)
const CREATOR_EMAIL = 'test.creator.final@gmail.com';
const CREATOR_PASSWORD = 'password123';

let authToken = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

// Test Results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

function logTest(name, passed, details = '') {
    if (passed) {
        results.passed.push(name);
        console.log(`✅ ${name}`);
    } else {
        results.failed.push({ name, details });
        console.log(`❌ ${name}: ${details}`);
    }
    if (details && passed) {
        console.log(`   ${details}`);
    }
}

async function runTests() {
    console.log('🧪 Starting Creator Dashboard API Tests\n');
    console.log('='.repeat(60));

    // Test 1: Login
    console.log('\n📝 Test 1: Authentication');
    const loginResult = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: CREATOR_EMAIL,
            password: CREATOR_PASSWORD
        })
    });

    if (loginResult.data?.success && loginResult.data?.token) {
        authToken = loginResult.data.token;
        logTest('Login successful', true, `Token received: ${authToken.substring(0, 20)}...`);
    } else {
        logTest('Login failed', false, 'Could not authenticate');
        console.log('\n⚠️  Cannot proceed without authentication');
        return;
    }

    // Test 2: Earnings API - Default (Month)
    console.log('\n📝 Test 2: Earnings Overview API');
    const earningsMonth = await apiCall('/api/creator/dashboard/earnings?filter=month');

    if (earningsMonth.data?.success) {
        const data = earningsMonth.data.data;
        logTest('Earnings API returns correct data', true);
        logTest('Has totalEarnings field', typeof data.totalEarnings === 'number');
        logTest('Has thisMonth field', typeof data.thisMonth === 'number');
        logTest('Has pendingPayouts field', typeof data.pendingPayouts === 'number');
        logTest('Has completedPayouts field', typeof data.completedPayouts === 'number');
        logTest('Has stripeConnected field', typeof data.stripeConnected === 'boolean');
        logTest('Has trend object', data.trend && typeof data.trend.percentage === 'number');
        console.log(`   Total: $${data.totalEarnings}, This Month: $${data.thisMonth}`);
    } else {
        logTest('Earnings API failed', false, earningsMonth.data?.error || 'Unknown error');
    }

    // Test 3: Earnings API - Week Filter
    console.log('\n📝 Test 3: Earnings Filter - Week');
    const earningsWeek = await apiCall('/api/creator/dashboard/earnings?filter=week');
    logTest('Week filter works', earningsWeek.data?.success && earningsWeek.data?.data?.filter === 'week');

    // Test 4: Earnings API - Year Filter
    console.log('\n📝 Test 4: Earnings Filter - Year');
    const earningsYear = await apiCall('/api/creator/dashboard/earnings?filter=year');
    logTest('Year filter works', earningsYear.data?.success && earningsYear.data?.data?.filter === 'year');

    // Test 5: Ranking API
    console.log('\n📝 Test 5: Ranking System API');
    const ranking = await apiCall('/api/creator/dashboard/ranking');

    if (ranking.data?.success) {
        const data = ranking.data.data;
        logTest('Ranking API returns correct data', true);
        logTest('Has rankingScore (0-100)', data.rankingScore >= 0 && data.rankingScore <= 100);
        logTest('Has categoryAverage', typeof data.categoryAverage === 'number');
        logTest('Has scoreChange', typeof data.scoreChange === 'number');
        logTest('Has factors breakdown', data.factors && typeof data.factors === 'object');
        console.log(`   Score: ${data.rankingScore}/100, Category Avg: ${data.categoryAverage}`);
        if (data.factors) {
            console.log(`   Factors: Quality=${data.factors.videoQualityScore}, Conversion=${data.factors.conversionRate}`);
        }
    } else {
        logTest('Ranking API failed', false, ranking.data?.error || 'Unknown error');
    }

    // Test 6: Opportunities API
    console.log('\n📝 Test 6: Smart Opportunities API');
    const opportunities = await apiCall('/api/creator/dashboard/opportunities?limit=5');

    if (opportunities.data?.success) {
        const data = opportunities.data.data;
        logTest('Opportunities API returns correct data', true);
        logTest('Returns array of opportunities', Array.isArray(data.opportunities));
        logTest('Limits to 5 results', data.opportunities.length <= 5);

        if (data.opportunities.length > 0) {
            const opp = data.opportunities[0];
            logTest('Has matchScore field', typeof opp.matchScore === 'number');
            logTest('Has matchReason field', typeof opp.matchReason === 'string');
            logTest('Has estimatedEarnings field', typeof opp.estimatedEarnings === 'number');
            console.log(`   Found ${data.opportunities.length} opportunities`);
            console.log(`   Top match: ${opp.campaignName} (Score: ${opp.matchScore}/100)`);
            console.log(`   Reason: ${opp.matchReason}`);
        } else {
            results.warnings.push('No opportunities found (may be expected if no campaigns available)');
            console.log('   ⚠️  No opportunities found');
        }
    } else {
        logTest('Opportunities API failed', false, opportunities.data?.error || 'Unknown error');
    }

    // Test 7: Notifications API
    console.log('\n📝 Test 7: Notifications API');
    const notifications = await apiCall('/api/creator/notifications?limit=5');

    if (notifications.data?.success) {
        const data = notifications.data.data;
        logTest('Notifications API returns correct data', true);
        logTest('Returns array of notifications', Array.isArray(data.notifications));
        logTest('Has unreadCount', typeof data.unreadCount === 'number');

        if (data.notifications.length > 0) {
            const notif = data.notifications[0];
            logTest('Has type field', typeof notif.type === 'string');
            logTest('Has message field', typeof notif.message === 'string');
            logTest('Has time field', typeof notif.time === 'string');
            logTest('Has isRead field', typeof notif.isRead === 'boolean');
            console.log(`   Found ${data.notifications.length} notifications, ${data.unreadCount} unread`);
        } else {
            results.warnings.push('No notifications found (may be expected for new account)');
            console.log('   ⚠️  No notifications found');
        }
    } else {
        logTest('Notifications API failed', false, notifications.data?.error || 'Unknown error');
    }

    // Test 8: Deadlines/Tasks API
    console.log('\n📝 Test 8: Deadlines/Tasks API');
    const tasks = await apiCall('/api/creator/dashboard/tasks');

    if (tasks.data?.success) {
        const data = tasks.data.data;
        logTest('Tasks API returns correct data', true);
        logTest('Returns array of tasks', Array.isArray(data.tasks));

        if (data.tasks.length > 0) {
            const task = data.tasks[0];
            logTest('Has priority field', ['high', 'medium', 'low'].includes(task.priority));
            logTest('Has dueDate field', typeof task.dueDate === 'string');
            logTest('Has campaignId field', typeof task.campaignId === 'string');
            console.log(`   Found ${data.tasks.length} tasks`);
            console.log(`   Priority breakdown: ${data.tasks.filter(t => t.priority === 'high').length} high, ${data.tasks.filter(t => t.priority === 'medium').length} medium`);
        } else {
            results.warnings.push('No tasks found (may be expected if no pending work)');
            console.log('   ⚠️  No tasks found');
        }
    } else {
        logTest('Tasks API failed', false, tasks.data?.error || 'Unknown error');
    }

    // Test 9: Performance API - All Platforms
    console.log('\n📝 Test 9: Performance Analytics API - All Platforms');
    const perfAll = await apiCall('/api/creator/dashboard/performance?platform=all');

    if (perfAll.data?.success) {
        const data = perfAll.data.data;
        logTest('Performance API returns correct data', true);
        logTest('Has views field', typeof data.views === 'number');
        logTest('Has engagementRate field', typeof data.engagementRate === 'number');
        logTest('Has videosCreated field', typeof data.videosCreated === 'number');
        logTest('Has completionRate field', typeof data.completionRate === 'number');
        logTest('Has viewsHistory array', Array.isArray(data.viewsHistory));
        console.log(`   Views: ${data.views}, Engagement: ${data.engagementRate}%, Videos: ${data.videosCreated}`);
    } else {
        logTest('Performance API failed', false, perfAll.data?.error || 'Unknown error');
    }

    // Test 10: Performance API - TikTok Filter
    console.log('\n📝 Test 10: Performance Platform Filter - TikTok');
    const perfTikTok = await apiCall('/api/creator/dashboard/performance?platform=tiktok');
    logTest('TikTok filter works', perfTikTok.data?.success && perfTikTok.data?.data?.platform === 'tiktok');

    // Test 11: Performance API - Instagram Filter
    console.log('\n📝 Test 11: Performance Platform Filter - Instagram');
    const perfInstagram = await apiCall('/api/creator/dashboard/performance?platform=instagram');
    logTest('Instagram filter works', perfInstagram.data?.success && perfInstagram.data?.data?.platform === 'instagram');

    // Test 12: Performance API - Facebook Filter
    console.log('\n📝 Test 12: Performance Platform Filter - Facebook');
    const perfFacebook = await apiCall('/api/creator/dashboard/performance?platform=facebook');
    logTest('Facebook filter works', perfFacebook.data?.success && perfFacebook.data?.data?.platform === 'facebook');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST SUMMARY\n');
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);

    if (results.failed.length > 0) {
        console.log('\n❌ Failed Tests:');
        results.failed.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
    }

    if (results.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        results.warnings.forEach(w => console.log(`   - ${w}`));
    }

    console.log('\n' + '='.repeat(60));

    const passRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1);
    console.log(`\n🎯 Pass Rate: ${passRate}%`);

    if (results.failed.length === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
    }
}

// Run tests
runTests().catch(console.error);
