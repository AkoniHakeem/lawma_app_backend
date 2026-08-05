import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function checkBillingData() {
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

    // Check what billing data exists
    const billingCountQuery = `
      SELECT COUNT(*) as total FROM billing
    `;
    const billingCount = await dataSource.query(billingCountQuery);
    console.log(`📊 Total billings in database: ${billingCount[0]?.total || 0}\n`);

    // Check distinct month/year combinations
    const distinctMonthsQuery = `
      SELECT DISTINCT month, year, COUNT(*) as count
      FROM billing
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 20
    `;
    const distinctMonths = await dataSource.query(distinctMonthsQuery);
    
    console.log('📅 Available billing periods (most recent 20):\n');
    for (const row of distinctMonths) {
      console.log(`   ${row.year}-${row.month}: ${row.count} billings`);
    }

    // Check payment data
    console.log('\n💵 Payment data check:\n');
    const paymentCountQuery = `
      SELECT COUNT(*) as total FROM payment WHERE "deletedAt" IS NULL
    `;
    const paymentCount = await dataSource.query(paymentCountQuery);
    console.log(`   Total payments: ${paymentCount[0]?.total || 0}`);

    const recentPaymentsQuery = `
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count,
        SUM(amount::numeric) as total_amount
      FROM payment
      WHERE "deletedAt" IS NULL
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 15
    `;
    const recentPayments = await dataSource.query(recentPaymentsQuery);
    
    console.log('\n   Recent payment months:\n');
    for (const row of recentPayments) {
      const amount = parseFloat(row.total_amount || '0');
      console.log(`   ${row.month}: ${row.count} payments, ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkBillingData()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
