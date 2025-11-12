#!/usr/bin/env node

import 'dotenv/config';
import { dataMigration } from './DataMigration.js';
import { databaseService } from '../services/DatabaseService.js';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
🗄️  Clipper MongoDB Migration Tool
==================================

Usage: node migrate.js [command] [options]

Commands:
  dry-run          Analyze data without making changes
  migrate          Perform full migration
  clear            Clear all collections
  health           Check database health

Options:
  --clear          Clear existing data before migration
  --help           Show this help message

Examples:
  node migrate.js dry-run
  node migrate.js migrate
  node migrate.js migrate --clear
  node migrate.js health
`);
}

async function runMigration() {
  const command = args[0];
  const clearExisting = args.includes('--clear');
  
  switch (command) {
    case 'dry-run':
      try {
        console.log('🔍 Running dry run analysis...\n');
        const analysis = await dataMigration.migrateAllData({ dryRun: true });
        
        console.log('\n📋 Analysis Complete!');
        console.log('Review the analysis above before running the actual migration.');
        console.log('Run "node migrate.js migrate" to perform the migration.');
      } catch (error) {
        console.error('❌ Dry run failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'migrate':
      try {
        console.log('🚀 Starting full migration...\n');
        const report = await dataMigration.migrateAllData({ clearExisting });
        
        console.log('\n🎉 Migration completed!');
        console.log('Your data has been successfully migrated to MongoDB.');
        
        if (report.summary.totalFailed > 0) {
          console.log('⚠️  Some items failed to migrate. Check the report above for details.');
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'clear':
      try {
        console.log('🧹 Clearing all collections...\n');
        
        await databaseService.initialize();
        const collections = ['customers', 'inventory', 'suppliers', 'orders', 'invoices'];
        
        for (const collection of collections) {
          const result = await databaseService.clearCollection(collection);
          console.log(`✅ Cleared ${collection}: ${result.deletedCount} documents`);
        }
        
        console.log('\n🗑️  All collections cleared successfully!');
      } catch (error) {
        console.error('❌ Clear operation failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'health':
      try {
        console.log('🏥 Checking database health...\n');
        
        const health = await databaseService.healthCheck();
        
        if (health.status === 'healthy') {
          console.log('✅ Database is healthy!');
          console.log(`📊 Connection: ${health.connection.host}:${health.connection.port}/${health.connection.name}`);
          console.log('📈 Collections:');
          Object.entries(health.collections).forEach(([name, count]) => {
            console.log(`   ${name}: ${count} documents`);
          });
        } else {
          console.log('❌ Database is unhealthy!');
          console.log('Error:', health.error);
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
      }
      break;
      
    case '--help':
    case '-h':
    case 'help':
      printUsage();
      break;
      
    default:
      console.error('❌ Unknown command:', command);
      printUsage();
      process.exit(1);
  }
}

// Check for help flags
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  printUsage();
  process.exit(0);
}

// Run the migration
runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });