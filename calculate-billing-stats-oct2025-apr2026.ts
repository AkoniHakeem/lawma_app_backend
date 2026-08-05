import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function calculateBillingStats() {
  console.log('🔍 Connecting to production database...');
  
  const databaseConfig = processDatabaseConfig();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    entities: [],
    synchronize: false,
    logging: false,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to production database\n');

    // Define the date range: October 2025 to April 2026
    const months = [
      { month: '10', year: '2025', name: 'October 2025' },
      { month: '11', year: '2025', name: 'November 2025' },
      { month: '12', year: '2025', name: 'December 2025' },
      { month: '01', year: '2026', name: 'January 2026' },
      { month: '02', year: '2026', name: 'February 2026' },
      { month: '03', year: '2026', name: 'March 2026' },
      { month: '04', year: '2026', name: 'April 2026' },
    ];

    // Get billing statistics
    console.log('📊 Calculating billing statistics from October 2025 to April 2026...\n');

    // Query billings for the period using raw SQL
    const billingStatsQuery = `
      SELECT 
        SUM(amount::numeric) as "totalBillings",
        AVG(amount::numeric) as "averageBilling",
        COUNT(id) as "billingCount"
      FROM billing
      WHERE (month = '10' AND year = '2025')
         OR (month = '11' AND year = '2025')
         OR (month = '12' AND year = '2025')
         OR (month = '01' AND year = '2026')
         OR (month = '02' AND year = '2026')
         OR (month = '03' AND year = '2026')
         OR (month = '04' AND year = '2026')
    `;

    const billingStats = await dataSource.query(billingStatsQuery);

    // Query payments for the period (using createdAt date) using raw SQL
    const paymentStatsQuery = `
      SELECT 
        SUM(amount::numeric) as "totalPayments",
        COUNT(id) as "paymentCount"
      FROM payment
      WHERE "createdAt" >= '2025-10-01'
        AND "createdAt" < '2026-05-01'
        AND "deletedAt" IS NULL
    `;

    const paymentStats = await dataSource.query(paymentStatsQuery);

    // Calculate collection rate
    const totalBillings = parseFloat(billingStats[0]?.totalBillings || '0');
    const totalPayments = parseFloat(paymentStats[0]?.totalPayments || '0');
    const averageBilling = parseFloat(billingStats[0]?.averageBilling || '0');
    const billingCount = parseInt(billingStats[0]?.billingCount || '0');
    const paymentCount = parseInt(paymentStats[0]?.paymentCount || '0');
    const collectionRate = totalBillings > 0 ? (totalPayments / totalBillings) * 100 : 0;

    // Display results
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  BILLING STATISTICS: OCTOBER 2025 - APRIL 2026');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📅 PERIOD: October 2025 to April 2026 (7 months)\n');

    console.log('💰 BILLING SUMMARY:');
    console.log(`   Total Billings Amount:    ₦${totalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Average Billing Amount:   ₦${averageBilling.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Number of Billings:       ${billingCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('💵 PAYMENT SUMMARY:');
    console.log(`   Total Payments Amount:    ₦${totalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Number of Payments:       ${paymentCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('📈 COLLECTION RATE:');
    console.log(`   Collection Rate:          ${collectionRate.toFixed(2)}%`);
    console.log(`   Outstanding Amount:       ₦${(totalBillings - totalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log('');

    // Monthly breakdown
    console.log('📊 MONTHLY BREAKDOWN:\n');

    for (const monthData of months) {
      const monthStatsQuery = `
        SELECT 
          SUM(amount::numeric) as "totalBillings",
          COUNT(id) as "billingCount"
        FROM billing
        WHERE month = '${monthData.month}' AND year = '${monthData.year}'
      `;

      const monthStats = await dataSource.query(monthStatsQuery);
      const monthTotal = parseFloat(monthStats[0]?.totalBillings || '0');
      const monthCount = parseInt(monthStats[0]?.billingCount || '0');

      console.log(`   ${monthData.name}:`);
      console.log(`     Amount: ₦${monthTotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${monthCount.toLocaleString('en-NG')} billings)`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
calculateBillingStats()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
