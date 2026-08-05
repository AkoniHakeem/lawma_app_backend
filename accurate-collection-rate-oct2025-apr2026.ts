import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function accurateCollectionAnalysis() {
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

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ACCURATE COLLECTION ANALYSIS: OCTOBER 2025 - APRIL 2026');
    console.log('  Golden Rising Sun Ventures l.t.d. (GRS)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const months = [
      { month: 'October', year: '2025', startDate: '2025-10-01', endDate: '2025-11-01' },
      { month: 'November', year: '2025', startDate: '2025-11-01', endDate: '2025-12-01' },
      { month: 'December', year: '2025', startDate: '2025-12-01', endDate: '2026-01-01' },
      { month: 'January', year: '2026', startDate: '2026-01-01', endDate: '2026-02-01' },
      { month: 'February', year: '2026', startDate: '2026-02-01', endDate: '2026-03-01' },
      { month: 'March', year: '2026', startDate: '2026-03-01', endDate: '2026-04-01' },
      { month: 'April', year: '2026', startDate: '2026-04-01', endDate: '2026-05-01' },
    ];

    let totalBillings = 0;
    let totalPayments = 0;
    let totalBillingCount = 0;
    let totalPaymentCount = 0;

    console.log('📊 MONTH-BY-MONTH BREAKDOWN:\n');

    for (const period of months) {
      // Get billings for this specific month
      const billingsQuery = `
        SELECT 
          COUNT(b.id) as billing_count,
          COALESCE(SUM(b.amount::numeric), 0) as total_billings
        FROM "billing" b
        JOIN "property_subscription" ps ON b."propertySubscriptionId" = ps.id
        WHERE ps."entityProfileId" = 1
          AND b.month = $1
          AND b.year = $2
      `;
      const billings = await dataSource.query(billingsQuery, [period.month, period.year]);

      // Get payments made during this calendar month (by createdAt date)
      const paymentsQuery = `
        SELECT 
          COUNT(p.id) as payment_count,
          COALESCE(SUM(p.amount::numeric), 0) as total_payments
        FROM "payment" p
        JOIN "property_subscription" ps ON p."propertySubscriptionId" = ps.id
        WHERE ps."entityProfileId" = 1
          AND p."createdAt" >= $1
          AND p."createdAt" < $2
          AND p."deletedAt" IS NULL
      `;
      const payments = await dataSource.query(paymentsQuery, [period.startDate, period.endDate]);

      const monthBillings = parseFloat(billings[0]?.total_billings || '0');
      const monthPayments = parseFloat(payments[0]?.total_payments || '0');
      const monthBillingCount = parseInt(billings[0]?.billing_count || '0');
      const monthPaymentCount = parseInt(payments[0]?.payment_count || '0');
      const monthCollectionRate = monthBillings > 0 ? (monthPayments / monthBillings) * 100 : 0;

      totalBillings += monthBillings;
      totalPayments += monthPayments;
      totalBillingCount += monthBillingCount;
      totalPaymentCount += monthPaymentCount;

      console.log(`${period.month} ${period.year}:`);
      console.log(`  Billings:        ₦${monthBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${monthBillingCount} bills)`);
      console.log(`  Payments:        ₦${monthPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${monthPaymentCount} payments)`);
      console.log(`  Collection Rate: ${monthCollectionRate.toFixed(2)}%`);
      console.log(`  Outstanding:     ₦${(monthBillings - monthPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log('');
    }

    const overallCollectionRate = totalBillings > 0 ? (totalPayments / totalBillings) * 100 : 0;

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  PERIOD TOTALS (OCTOBER 2025 - APRIL 2026)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`  Total Billings:      ₦${totalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${totalBillingCount} bills)`);
    console.log(`  Average per Bill:    ₦${(totalBillings / totalBillingCount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`  Average Monthly:     ₦${(totalBillings / 7).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log('');
    console.log(`  Total Payments:      ₦${totalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${totalPaymentCount} payments)`);
    console.log(`  Average per Payment: ₦${totalPaymentCount > 0 ? (totalPayments / totalPaymentCount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}`);
    console.log('');
    console.log(`  Collection Rate:     ${overallCollectionRate.toFixed(2)}%`);
    console.log(`  Outstanding:         ₦${(totalBillings - totalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);

    // Get billing account totals for context
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  BILLING ACCOUNT SUMMARY (ALL TIME)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const accountSummaryQuery = `
      SELECT 
        COALESCE(SUM(ba."totalBillings"::numeric), 0) as total_billings_ever,
        COALESCE(SUM(ba."totalPayments"::numeric), 0) as total_payments_ever,
        COUNT(ba.id) as account_count
      FROM "billing_account" ba
      JOIN "property_subscription" ps ON ba."propertySubscriptionId" = ps.id
      WHERE ps."entityProfileId" = 1
    `;
    const accountSummary = await dataSource.query(accountSummaryQuery);

    const allTimeBillings = parseFloat(accountSummary[0]?.total_billings_ever || '0');
    const allTimePayments = parseFloat(accountSummary[0]?.total_payments_ever || '0');
    const accountCount = parseInt(accountSummary[0]?.account_count || '0');
    const allTimeArrears = allTimeBillings - allTimePayments;
    const allTimeCollectionRate = allTimeBillings > 0 ? (allTimePayments / allTimeBillings) * 100 : 0;

    console.log(`  Accounts:            ${accountCount}`);
    console.log(`  Total Billings Ever: ₦${allTimeBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Payments Ever: ₦${allTimePayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Arrears:       ₦${allTimeArrears.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`  Collection Rate:     ${allTimeCollectionRate.toFixed(2)}%`);

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

accurateCollectionAnalysis()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
