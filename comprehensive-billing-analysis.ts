import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

// Month name to number mapping
const monthNameToNumber: { [key: string]: string } = {
  'January': '01',
  'February': '02',
  'March': '03',
  'April': '04',
  'May': '05',
  'June': '06',
  'July': '07',
  'August': '08',
  'September': '09',
  'October': '10',
  'November': '11',
  'December': '12',
};

async function comprehensiveAnalysis() {
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
    console.log('  LAWMA BILLING & COLLECTION ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get all billing periods
    const billingPeriodsQuery = `
      SELECT 
        month, 
        year, 
        COUNT(*) as count, 
        SUM(amount::numeric) as total_amount,
        CASE month
          WHEN 'January' THEN 1
          WHEN 'February' THEN 2
          WHEN 'March' THEN 3
          WHEN 'April' THEN 4
          WHEN 'May' THEN 5
          WHEN 'June' THEN 6
          WHEN 'July' THEN 7
          WHEN 'August' THEN 8
          WHEN 'September' THEN 9
          WHEN 'October' THEN 10
          WHEN 'November' THEN 11
          WHEN 'December' THEN 12
        END as month_num
      FROM billing
      GROUP BY year, month
      ORDER BY year DESC, month_num DESC
    `;
    const billingPeriods = await dataSource.query(billingPeriodsQuery);

    console.log('📊 AVAILABLE BILLING PERIODS:\n');
    for (const period of billingPeriods) {
      const amount = parseFloat(period.total_amount || '0');
      console.log(`   ${period.month} ${period.year}: ${period.count} billings, ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    }

    // Target period: October 2025 - April 2026
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  REQUESTED PERIOD: OCTOBER 2025 - APRIL 2026');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const targetMonths = [
      'October', 'November', 'December', // 2025
      'January', 'February', 'March', 'April' // 2026
    ];

    // Check billings for target period
    const targetBillingsQuery = `
      SELECT 
        SUM(amount::numeric) as total_billings,
        AVG(amount::numeric) as avg_billing,
        COUNT(*) as billing_count
      FROM billing
      WHERE (month = 'October' AND year = '2025')
         OR (month = 'November' AND year = '2025')
         OR (month = 'December' AND year = '2025')
         OR (month = 'January' AND year = '2026')
         OR (month = 'February' AND year = '2026')
         OR (month = 'March' AND year = '2026')
         OR (month = 'April' AND year = '2026')
    `;
    const targetBillings = await dataSource.query(targetBillingsQuery);

    // Check payments for target period
    const targetPaymentsQuery = `
      SELECT 
        SUM(amount::numeric) as total_payments,
        COUNT(*) as payment_count
      FROM payment
      WHERE "createdAt" >= '2025-10-01'
        AND "createdAt" < '2026-05-01'
        AND "deletedAt" IS NULL
    `;
    const targetPayments = await dataSource.query(targetPaymentsQuery);

    const totalBillings = parseFloat(targetBillings[0]?.total_billings || '0');
    const avgBilling = parseFloat(targetBillings[0]?.avg_billing || '0');
    const billingCount = parseInt(targetBillings[0]?.billing_count || '0');
    const totalPayments = parseFloat(targetPayments[0]?.total_payments || '0');
    const paymentCount = parseInt(targetPayments[0]?.payment_count || '0');
    const collectionRate = totalBillings > 0 ? (totalPayments / totalBillings) * 100 : 0;

    console.log('💰 BILLING SUMMARY:');
    console.log(`   Total Billings:           ₦${totalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Average Billing:          ₦${avgBilling.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Number of Billings:       ${billingCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('💵 PAYMENT SUMMARY:');
    console.log(`   Total Payments:           ₦${totalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Number of Payments:       ${paymentCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('📈 COLLECTION RATE:');
    if (totalBillings > 0) {
      console.log(`   Collection Rate:          ${collectionRate.toFixed(2)}%`);
      console.log(`   Outstanding Amount:       ₦${(totalBillings - totalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    } else {
      console.log(`   ⚠️  NO BILLINGS FOUND FOR THIS PERIOD`);
      console.log(`   Collection Rate:          N/A`);
    }

    // Calculate for ALL available data
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  OVERALL STATISTICS (ALL TIME)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const allBillingsQuery = `
      SELECT 
        SUM(amount::numeric) as total_billings,
        AVG(amount::numeric) as avg_billing,
        COUNT(*) as billing_count,
        MIN(year || '-' || CASE month
          WHEN 'January' THEN '01'
          WHEN 'February' THEN '02'
          WHEN 'March' THEN '03'
          WHEN 'April' THEN '04'
          WHEN 'May' THEN '05'
          WHEN 'June' THEN '06'
          WHEN 'July' THEN '07'
          WHEN 'August' THEN '08'
          WHEN 'September' THEN '09'
          WHEN 'October' THEN '10'
          WHEN 'November' THEN '11'
          WHEN 'December' THEN '12'
        END) as earliest_period,
        MAX(year || '-' || CASE month
          WHEN 'January' THEN '01'
          WHEN 'February' THEN '02'
          WHEN 'March' THEN '03'
          WHEN 'April' THEN '04'
          WHEN 'May' THEN '05'
          WHEN 'June' THEN '06'
          WHEN 'July' THEN '07'
          WHEN 'August' THEN '08'
          WHEN 'September' THEN '09'
          WHEN 'October' THEN '10'
          WHEN 'November' THEN '11'
          WHEN 'December' THEN '12'
        END) as latest_period
      FROM billing
    `;
    const allBillings = await dataSource.query(allBillingsQuery);

    const allPaymentsQuery = `
      SELECT 
        SUM(amount::numeric) as total_payments,
        COUNT(*) as payment_count
      FROM payment
      WHERE "deletedAt" IS NULL
    `;
    const allPayments = await dataSource.query(allPaymentsQuery);

    const allTotalBillings = parseFloat(allBillings[0]?.total_billings || '0');
    const allAvgBilling = parseFloat(allBillings[0]?.avg_billing || '0');
    const allBillingCount = parseInt(allBillings[0]?.billing_count || '0');
    const allTotalPayments = parseFloat(allPayments[0]?.total_payments || '0');
    const allPaymentCount = parseInt(allPayments[0]?.payment_count || '0');
    const allCollectionRate = allTotalBillings > 0 ? (allTotalPayments / allTotalBillings) * 100 : 0;

    console.log(`📅 Period: ${allBillings[0]?.earliest_period || 'N/A'} to ${allBillings[0]?.latest_period || 'N/A'}\n`);

    console.log('💰 BILLING SUMMARY:');
    console.log(`   Total Billings:           ₦${allTotalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Average Billing:          ₦${allAvgBilling.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Number of Billings:       ${allBillingCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('💵 PAYMENT SUMMARY:');
    console.log(`   Total Payments:           ₦${allTotalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    console.log(`   Number of Payments:       ${allPaymentCount.toLocaleString('en-NG')}`);
    console.log('');

    console.log('📈 COLLECTION RATE:');
    console.log(`   Collection Rate:          ${allCollectionRate.toFixed(2)}%`);
    console.log(`   Outstanding Amount:       ₦${(allTotalBillings - allTotalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);

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

comprehensiveAnalysis()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
