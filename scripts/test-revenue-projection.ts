/**
 * Test script to verify revenue projection calculations
 * 
 * Expected Test Case:
 * Budget = $1,000
 * Videos = 20
 * Views = 150,000
 * Download Rate = 3%
 * Paid Conversion = 2%
 * Monthly Price = $15
 * Churn Rate = 15%
 * 
 * Expected Results:
 * - Downloads: 4,500
 * - Paying Customers: 90
 * - New Revenue: $1,350
 * - Month 1: Total Customers = 77, MRR = $1,147.50
 * - Month 2: Total Customers = 142, MRR = $2,122.88
 * - Month 3: Total Customers = 197, MRR = $2,951.94
 */

async function testRevenueProjection() {
    const testData = {
        impressions: 150000,
        downloadRate: 3,
        paidConversionRate: 2,
        monthlyPrice: 15,
        monthlyChurnRate: 15,
        months: 12
    };

    console.log('Testing Revenue Projection Calculator...\n');
    console.log('Input Parameters:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n---\n');

    try {
        const response = await fetch('http://localhost:3000/api/revenue-projection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();

        console.log('Summary Results:');
        console.log(`Impressions: ${result.summary.impressions.toLocaleString()}`);
        console.log(`Downloads: ${result.summary.downloads.toLocaleString()}`);
        console.log(`Paying Customers: ${result.summary.payingCustomers}`);
        console.log(`New Revenue: $${result.summary.newRevenue.toLocaleString()}`);
        console.log('\n---\n');

        console.log('First 3 Months:');
        result.monthlyData.slice(0, 3).forEach((month: any) => {
            console.log(`Month ${month.month}:`);
            console.log(`  Total Downloads: ${month.totalDownloads.toLocaleString()}`);
            console.log(`  New Customers: ${month.newCustomers}`);
            console.log(`  Lost Customers: ${month.lostCustomers}`);
            console.log(`  Total Customers: ${month.totalCustomers}`);
            console.log(`  MRR: $${month.mrr.toLocaleString()}`);
            console.log('');
        });

        console.log('\n---\n');
        console.log('Validation:');

        const checks = [
            { name: 'Downloads', expected: 4500, actual: result.summary.downloads },
            { name: 'Paying Customers', expected: 90, actual: result.summary.payingCustomers },
            { name: 'New Revenue', expected: 1350, actual: result.summary.newRevenue },
            { name: 'Month 1 Total Customers', expected: 77, actual: result.monthlyData[0].totalCustomers },
            { name: 'Month 1 MRR', expected: 1147.50, actual: result.monthlyData[0].mrr },
            { name: 'Month 2 Total Customers', expected: 142, actual: result.monthlyData[1].totalCustomers },
            { name: 'Month 2 MRR', expected: 2122.88, actual: result.monthlyData[1].mrr },
            { name: 'Month 3 Total Customers', expected: 197, actual: result.monthlyData[2].totalCustomers },
            { name: 'Month 3 MRR', expected: 2951.94, actual: result.monthlyData[2].mrr },
        ];

        let allPassed = true;
        checks.forEach(check => {
            const passed = Math.abs(check.expected - check.actual) < 0.01;
            const status = passed ? '✓' : '✗';
            console.log(`${status} ${check.name}: Expected ${check.expected}, Got ${check.actual}`);
            if (!passed) allPassed = false;
        });

        console.log('\n---\n');
        console.log(allPassed ? '✓ All tests PASSED!' : '✗ Some tests FAILED!');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testRevenueProjection();
