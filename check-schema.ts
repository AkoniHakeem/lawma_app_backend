import { DataSource } from 'typeorm';
import processDatabaseConfig from './src/config/envs/database.config';

async function checkSchema() {
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

    // Check property_subscription columns
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'property_subscription'
      ORDER BY ordinal_position
    `;
    
    const columns = await dataSource.query(columnsQuery);
    console.log('property_subscription columns:');
    console.log(columns);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

checkSchema();
