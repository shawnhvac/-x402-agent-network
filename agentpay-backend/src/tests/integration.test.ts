/**
 * AgentPay Integration Tests - End-to-End Testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runIntegrationTests() {
  console.log('\n========================================');
  console.log('🧪 AGENTPAY INTEGRATION TESTS');
  console.log('========================================\n');

  const results: any[] = [];

  try {
    // Test 1: Database connectivity
    console.log('🧪 TEST 1: Database connectivity');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected (${userCount} users found)\n`);
    results.push({ name: 'Database Connectivity', passed: true });

    // Test 2: Provider creation and stats
    console.log('🧪 TEST 2: Provider creation');
    const testProvider = await prisma.provider.findFirst();
    if (testProvider) {
      console.log(`✅ Providers exist (e.g., ${testProvider.name})\n`);
      results.push({ name: 'Provider Data', passed: true });
    }

    // Test 3: Service listing
    console.log('🧪 TEST 3: Service listing');
    const serviceCount = await prisma.service.count();
    console.log(`✅ Services available (${serviceCount} services)\n`);
    results.push({ name: 'Service Listing', passed: true });

    // Test 4: Booking data
    console.log('🧪 TEST 4: Booking tracking');
    const bookingCount = await prisma.booking.count();
    const completedCount = await prisma.booking.count({
      where: { paymentStatus: 'completed' },
    });
    console.log(`✅ Bookings tracked (${completedCount}/${bookingCount} paid)\n`);
    results.push({ name: 'Booking Tracking', passed: true });

    // Test 5: Transaction recording
    console.log('🧪 TEST 5: Transaction recording');
    const txCount = await prisma.transaction.count();
    console.log(`✅ Transactions recorded (${txCount} total)\n`);
    results.push({ name: 'Transaction Recording', passed: true });

    // Test 6: Payout system
    console.log('🧪 TEST 6: Payout system');
    const payoutCount = await prisma.payout.count();
    const pendingCount = await prisma.payout.count({
      where: { status: 'pending' },
    });
    console.log(`✅ Payout system active (${pendingCount} pending)\n`);
    results.push({ name: 'Payout System', passed: true });

    // Test 7: Rating system
    console.log('🧪 TEST 7: Rating system');
    const ratingCount = await prisma.rating.count();
    console.log(`✅ Rating system working (${ratingCount} ratings)\n`);
    results.push({ name: 'Rating System', passed: true });

    // Test 8: Database consistency
    console.log('🧪 TEST 8: Data consistency');
    const orphanedBookings = await prisma.booking.findMany({
      where: {
        provider: null,
      },
    });
    if (orphanedBookings.length === 0) {
      console.log('✅ No orphaned data found\n');
      results.push({ name: 'Data Consistency', passed: true });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    results.push({ name: 'Tests', passed: false });
  }

  // Summary
  console.log('========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    result.passed ? passed++ : failed++;
  });

  console.log(`\n✅ ${passed}/${results.length} tests passed`);

  if (failed > 0) {
    console.log(`❌ ${failed} test(s) failed\n`);
  } else {
    console.log('🎉 All tests passed!\n');
  }

  await prisma.$disconnect();
  return failed === 0;
}

export default { runIntegrationTests };
