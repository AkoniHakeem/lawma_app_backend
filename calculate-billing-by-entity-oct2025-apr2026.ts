import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function calculateBillingStatsByEntity() {
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
    console.log('  BILLING ANALYSIS BY ENTITY PROFILE');
    console.log('  Period: October 2025 - April 2026');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get all entity profiles with their billing statistics
    const entityBillingsQuery = `
      SELECT 
        ep.id as entity_profile_id,
        ep.name as entity_name,
        COUNT(DISTINCT b.id) as total_billings_count,
        SUM(b.amount::numeric) as total_billings_amount,
        AVG(b.amount::numeric) as average_billing_amount,
        COUNT(DISTINCT pay.id) as total_payments_count,
        SUM(pay.amount::numeric) as total_payments_amount,
        CASE 
          WHEN SUM(b.amount::numeric) > 0 
          THEN (SUM(pay.amount::numeric) / SUM(b.amount::numeric)) * 100 
          ELSE 0 
        END as collection_rate
      FROM "entity_profile" ep
      LEFT JOIN "property_subscription" ps ON ps."entityProfileId" = ep.id
      LEFT JOIN "billing" b ON b."propertySubscriptionId" = ps.id
        AND (
          (b.month = 'October' AND b.year = '2025')
          OR (b.month = 'November' AND b.year = '2025')
          OR (b.month = 'December' AND b.year = '2025')
          OR (b.month = 'January' AND b.year = '2026')
          OR (b.month = 'February' AND b.year = '2026')
          OR (b.month = 'March' AND b.year = '2026')
          OR (b.month = 'April' AND b.year = '2026')
        )
      LEFT JOIN "payment" pay ON pay."propertySubscriptionId" = ps.id
        AND pay."createdAt" >= '2025-10-01'
        AND pay."createdAt" < '2026-05-01'
        AND pay."deletedAt" IS NULL
      GROUP BY ep.id, ep.name
      HAVING COUNT(DISTINCT b.id) > 0
      ORDER BY total_billings_amount DESC NULLS LAST
    `;

    const entityBillings = await dataSource.query(entityBillingsQuery);

    if (entityBillings.length === 0) {
      console.log('⚠️  NO BILLINGS FOUND FOR OCTOBER 2025 - APRIL 2026\n');
      console.log('Let me check all available data...\n');
      
      // Check all time data by entity
      const allTimeQuery = `
        SELECT 
          ep.id as entity_profile_id,
          ep.name as entity_name,
          COUNT(DISTINCT b.id) as total_billings_count,
          SUM(b.amount::numeric) as total_billings_amount,
          AVG(b.amount::numeric) as average_billing_amount,
          COUNT(DISTINCT pay.id) as total_payments_count,
          SUM(pay.amount::numeric) as total_payments_amount,
          CASE 
            WHEN SUM(b.amount::numeric) > 0 
            THEN (SUM(pay.amount::numeric) / SUM(b.amount::numeric)) * 100 
            ELSE 0 
          END as collection_rate
        FROM "entity_profile" ep
        LEFT JOIN "property_subscription" ps ON ps."entityProfileId" = ep.id
        LEFT JOIN "billing" b ON b."propertySubscriptionId" = ps.id
        LEFT JOIN "payment" pay ON pay."propertySubscriptionId" = ps.id
          AND pay."deletedAt" IS NULL
        GROUP BY ep.id, ep.name
        HAVING COUNT(DISTINCT b.id) > 0
        ORDER BY total_billings_amount DESC NULLS LAST
      `;

      const allTimeData = await dataSource.query(allTimeQuery);

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('  ALL TIME BILLING BY ENTITY PROFILE');
      console.log('═══════════════════════════════════════════════════════════════\n');

      let grandTotalBillings = 0;
      let grandTotalPayments = 0;
      let grandTotalBillingCount = 0;

      for (const entity of allTimeData) {
        const billingAmount = parseFloat(entity.total_billings_amount || '0');
        const paymentAmount = parseFloat(entity.total_payments_amount || '0');
        const avgBilling = parseFloat(entity.average_billing_amount || '0');
        const collectionRate = parseFloat(entity.collection_rate || '0');
        const billingCount = parseInt(entity.total_billings_count || '0');
        const paymentCount = parseInt(entity.total_payments_count || '0');

        grandTotalBillings += billingAmount;
        grandTotalPayments += paymentAmount;
        grandTotalBillingCount += billingCount;

        console.log(`\n📊 ${entity.entity_name || 'Unknown Entity'} (ID: ${entity.entity_profile_id})`);
        console.log(`   ${'─'.repeat(60)}`);
        console.log(`   Total Billings:       ₦${billingAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${billingCount} billings)`);
        console.log(`   Average Billing:      ₦${avgBilling.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
        console.log(`   Total Payments:       ₦${paymentAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${paymentCount} payments)`);
        console.log(`   Collection Rate:      ${collectionRate.toFixed(2)}%`);
        console.log(`   Outstanding:          ₦${(billingAmount - paymentAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      }

      const overallCollectionRate = grandTotalBillings > 0 
        ? (grandTotalPayments / grandTotalBillings) * 100 
        : 0;

      console.log('\n\n═══════════════════════════════════════════════════════════════');
      console.log('  GRAND TOTALS (ALL ENTITIES, ALL TIME)');
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log(`   Total Entities:       ${allTimeData.length}`);
      console.log(`   Total Billings:       ₦${grandTotalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${grandTotalBillingCount} billings)`);
      console.log(`   Average per Billing:  ₦${(grandTotalBillings / grandTotalBillingCount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Total Payments:       ₦${grandTotalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Collection Rate:      ${overallCollectionRate.toFixed(2)}%`);
      console.log(`   Outstanding:          ₦${(grandTotalBillings - grandTotalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);

      // Get monthly breakdown for the largest entity
      if (allTimeData.length > 0) {
        const largestEntity = allTimeData[0];
        console.log('\n\n═══════════════════════════════════════════════════════════════');
        console.log(`  MONTHLY BREAKDOWN: ${largestEntity.entity_name}`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        const monthlyQuery = `
          SELECT 
            b.month,
            b.year,
            COUNT(b.id) as billing_count,
            SUM(b.amount::numeric) as total_amount,
            AVG(b.amount::numeric) as avg_amount
          FROM "billing" b
          JOIN "property_subscription" ps ON b."propertySubscriptionId" = ps.id
          WHERE ps."entityProfileId" = $1
          GROUP BY b.year, b.month,
            CASE b.month
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
            END
          ORDER BY b.year DESC,
            CASE b.month
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
            END DESC
        `;

        const monthlyData = await dataSource.query(monthlyQuery, [largestEntity.entity_profile_id]);

        for (const month of monthlyData) {
          const amount = parseFloat(month.total_amount || '0');
          const avg = parseFloat(month.avg_amount || '0');
          console.log(`   ${month.month} ${month.year}:`);
          console.log(`     Total: ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} | Avg: ₦${avg.toLocaleString('en-NG', { minimumFractionDigits: 2 })} | Count: ${month.billing_count}`);
        }
      }

    } else {
      // Display results for October 2025 - April 2026
      let grandTotalBillings = 0;
      let grandTotalPayments = 0;
      let grandTotalBillingCount = 0;

      for (const entity of entityBillings) {
        const billingAmount = parseFloat(entity.total_billings_amount || '0');
        const paymentAmount = parseFloat(entity.total_payments_amount || '0');
        const avgBilling = parseFloat(entity.average_billing_amount || '0');
        const collectionRate = parseFloat(entity.collection_rate || '0');
        const billingCount = parseInt(entity.total_billings_count || '0');
        const paymentCount = parseInt(entity.total_payments_count || '0');

        grandTotalBillings += billingAmount;
        grandTotalPayments += paymentAmount;
        grandTotalBillingCount += billingCount;

        console.log(`\n📊 ${entity.entity_name || 'Unknown Entity'} (ID: ${entity.entity_profile_id})`);
        console.log(`   ${'─'.repeat(60)}`);
        console.log(`   Total Billings:       ₦${billingAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${billingCount} billings)`);
        console.log(`   Average Billing:      ₦${avgBilling.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
        console.log(`   Total Payments:       ₦${paymentAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${paymentCount} payments)`);
        console.log(`   Collection Rate:      ${collectionRate.toFixed(2)}%`);
        console.log(`   Outstanding:          ₦${(billingAmount - paymentAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      }

      const overallCollectionRate = grandTotalBillings > 0 
        ? (grandTotalPayments / grandTotalBillings) * 100 
        : 0;

      console.log('\n\n═══════════════════════════════════════════════════════════════');
      console.log('  SUMMARY (OCTOBER 2025 - APRIL 2026)');
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log(`   Total Entities:       ${entityBillings.length}`);
      console.log(`   Total Billings:       ₦${grandTotalBillings.toLocaleString('en-NG', { minimumFractionDigits: 2 })} (${grandTotalBillingCount} billings)`);
      console.log(`   Average per Billing:  ₦${(grandTotalBillings / grandTotalBillingCount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Total Payments:       ₦${grandTotalPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Collection Rate:      ${overallCollectionRate.toFixed(2)}%`);
      console.log(`   Outstanding:          ₦${(grandTotalBillings - grandTotalPayments).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
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

calculateBillingStatsByEntity()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
