import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function detailedMonthlyAnalysis() {
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

    // Get ALL monthly billing data by entity profile
    const monthlyByEntityQuery = `
      SELECT 
        ep.id as entity_profile_id,
        ep.name as entity_name,
        b.month,
        b.year,
        COUNT(b.id) as billing_count,
        SUM(b.amount::numeric) as total_billings,
        AVG(b.amount::numeric) as avg_billing,
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
        END as month_num
      FROM "billing" b
      JOIN "property_subscription" ps ON b."propertySubscriptionId" = ps.id
      JOIN "entity_profile" ep ON ps."entityProfileId" = ep.id
      GROUP BY ep.id, ep.name, b.year, b.month
      ORDER BY ep.id, b.year DESC, month_num DESC
    `;

    const monthlyData = await dataSource.query(monthlyByEntityQuery);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  DETAILED MONTHLY BILLING BY ENTITY PROFILE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let currentEntity = null;
    let entityTotal = 0;
    let entityMonthCount = 0;

    for (const row of monthlyData) {
      if (currentEntity !== row.entity_profile_id) {
        if (currentEntity !== null) {
          console.log(`\n   ${'═'.repeat(60)}`);
          console.log(`   ENTITY TOTAL: ₦${entityTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
          console.log(`   AVERAGE PER MONTH: ₦${(entityTotal / entityMonthCount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
          console.log('\n');
        }

        currentEntity = row.entity_profile_id;
        entityTotal = 0;
        entityMonthCount = 0;
        console.log(`\n📊 ${row.entity_name || 'Unknown'} (ID: ${row.entity_profile_id})`);
        console.log(`   ${'─'.repeat(60)}\n`);
      }

      const amount = parseFloat(row.total_billings || '0');
      const avg = parseFloat(row.avg_billing || '0');
      entityTotal += amount;
      entityMonthCount++;

      console.log(`   ${row.month} ${row.year}:`);
      console.log(`     Total: ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`     Count: ${row.billing_count} billings`);
      console.log(`     Average: ₦${avg.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    }

    // Print last entity total
    if (currentEntity !== null) {
      console.log(`\n   ${'═'.repeat(60)}`);
      console.log(`   ENTITY TOTAL: ₦${entityTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   AVERAGE PER MONTH: ₦${(entityTotal / entityMonthCount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
    }

    // Check property subscription count per entity
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  PROPERTY SUBSCRIPTION STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const propertyStatsQuery = `
      SELECT 
        ep.id as entity_profile_id,
        ep.name as entity_name,
        COUNT(DISTINCT ps.id) as total_properties,
        COUNT(DISTINCT CASE WHEN ps."deletedAt" IS NULL THEN ps.id END) as active_properties
      FROM "entity_profile" ep
      LEFT JOIN "property_subscription" ps ON ps."entityProfileId" = ep.id
      GROUP BY ep.id, ep.name
      ORDER BY total_properties DESC
    `;

    const propertyStats = await dataSource.query(propertyStatsQuery);

    for (const stat of propertyStats) {
      console.log(`\n📊 ${stat.entity_name || 'Unknown'} (ID: ${stat.entity_profile_id})`);
      console.log(`   Total Properties: ${stat.total_properties}`);
      console.log(`   Active (Non-Deleted): ${stat.active_properties}`);
    }

    // Check if there are property subscriptions without billings
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  PROPERTIES WITHOUT BILLINGS FOR OCT 2025 - APR 2026');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const unbildPropertiesQuery = `
      SELECT 
        ep.name as entity_name,
        COUNT(DISTINCT ps.id) as properties_without_billings
      FROM "property_subscription" ps
      JOIN "entity_profile" ep ON ps."entityProfileId" = ep.id
      WHERE ps."deletedAt" IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM "billing" b
          WHERE b."propertySubscriptionId" = ps.id
            AND (
              (b.month = 'October' AND b.year = '2025')
              OR (b.month = 'November' AND b.year = '2025')
              OR (b.month = 'December' AND b.year = '2025')
              OR (b.month = 'January' AND b.year = '2026')
              OR (b.month = 'February' AND b.year = '2026')
              OR (b.month = 'March' AND b.year = '2026')
              OR (b.month = 'April' AND b.year = '2026')
            )
        )
      GROUP BY ep.name
    `;

    const unbilledProperties = await dataSource.query(unbildPropertiesQuery);

    for (const row of unbilledProperties) {
      console.log(`   ${row.entity_name}: ${row.properties_without_billings} properties without billings`);
    }

    // Calculate what the billings SHOULD be if generated
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('  PROJECTED BILLINGS FOR OCT 2025 - APR 2026');
    console.log('  (Based on active properties and current billing amounts)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const projectedQuery = `
      SELECT 
        ep.name as entity_name,
        COUNT(DISTINCT ps.id) as active_properties,
        AVG(ba."totalBillings"::numeric / NULLIF(
          (SELECT COUNT(*) FROM "billing" b2 WHERE b2."propertySubscriptionId" = ps.id), 0
        )) as avg_monthly_billing_per_property
      FROM "property_subscription" ps
      JOIN "entity_profile" ep ON ps."entityProfileId" = ep.id
      LEFT JOIN "billing_account" ba ON ba."propertySubscriptionId" = ps.id
      WHERE ps."deletedAt" IS NULL
      GROUP BY ep.name
    `;

    const projectedData = await dataSource.query(projectedQuery);

    for (const row of projectedData) {
      const avgPerProperty = parseFloat(row.avg_monthly_billing_per_property || '0');
      const properties = parseInt(row.active_properties || '0');
      const monthlyProjection = avgPerProperty * properties;
      const sevenMonthProjection = monthlyProjection * 7;

      console.log(`\n📊 ${row.entity_name || 'Unknown'}`);
      console.log(`   Active Properties: ${properties}`);
      console.log(`   Avg Monthly/Property: ₦${avgPerProperty.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Projected Monthly Total: ₦${monthlyProjection.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
      console.log(`   Projected 7-Month Total (Oct-Apr): ₦${sevenMonthProjection.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`);
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

detailedMonthlyAnalysis()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
