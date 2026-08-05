import { DataSource } from 'typeorm';
import { EntityProfile } from './src/utils-billing/entitties/entityProfile.entity';
import { EntityProfilePreference } from './src/utils-billing/entitties/entityProfilePreference.entity';
import { PropertySubscription } from './src/utils-billing/entitties/propertySubscription.entity';

async function testBillingGeneration() {
  // Create connection to local database
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'lawma_app',
    entities: ['src/**/*.entity.ts'],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check entity profiles
    const entityProfiles = await dataSource.getRepository(EntityProfile).find({
      relations: ['entityProfilePreference'],
    });

    console.log(`\n📊 Found ${entityProfiles.length} entity profiles:`);

    for (const profile of entityProfiles) {
      const preference = profile.entityProfilePreference;
      const autoGen = preference?.autoGenerateBills || false;

      console.log(`\n  🏢 ${profile.name} (ID: ${profile.id})`);
      console.log(
        `     - Auto-generate: ${autoGen ? '✅ ENABLED' : '❌ DISABLED'}`,
      );

      if (preference) {
        console.log(
          `     - SMS notifications: ${
            preference.enableSmsNotifications ? '✅' : '❌'
          }`,
        );
        console.log(
          `     - Email notifications: ${
            preference.enableEmailNotifications ? '✅' : '❌'
          }`,
        );
      } else {
        console.log(`     - ⚠️  No preferences record found`);
      }

      // Count active property subscriptions
      const activeProps = await dataSource
        .getRepository(PropertySubscription)
        .count({
          where: {
            entityProfileId: profile.id,
            isBillingActive: true,
            deletedAt: null as any,
          },
        });

      console.log(`     - Active property subscriptions: ${activeProps}`);
    }

    // Show instructions to enable auto-generation
    console.log('\n\n📝 To enable auto-billing generation in production:');
    console.log('='.repeat(60));

    const disabledProfiles = entityProfiles.filter(
      (p) => !p.entityProfilePreference?.autoGenerateBills,
    );

    if (disabledProfiles.length > 0) {
      console.log('\n1️⃣  Connect to production database:');
      console.log('   psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME>');
      console.log('\n2️⃣  Enable auto-generation for entity profiles:');

      for (const profile of disabledProfiles) {
        if (profile.entityProfilePreference) {
          console.log(`\n   -- Enable for ${profile.name}`);
          console.log(`   UPDATE entity_profile_preference`);
          console.log(`   SET "autoGenerateBills" = true`);
          console.log(`   WHERE "entityProfileId" = '${profile.id}';`);
        } else {
          console.log(`\n   -- Create preferences for ${profile.name}`);
          console.log(
            `   INSERT INTO entity_profile_preference ("entityProfileId", "autoGenerateBills", "enableSmsNotifications", "enableEmailNotifications")`,
          );
          console.log(`   VALUES ('${profile.id}', true, true, true);`);
        }
      }

      console.log('\n3️⃣  Verify the changes:');
      console.log('   SELECT ep.name, epp."autoGenerateBills"');
      console.log('   FROM entity_profile ep');
      console.log(
        '   LEFT JOIN entity_profile_preference epp ON ep.id = epp."entityProfileId";',
      );
    } else {
      console.log('\n✅ All entity profiles have auto-generation enabled!');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testBillingGeneration().then(() => {
  console.log('\n✅ Test completed\n');
  process.exit(0);
});
