/**
 * Build-time data processor
 * Converts data/raw.csv → data/processed.json
 * Run with: npm run process-data
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseRawCSV, transformToProcessed } from './loadData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..', '..');
const RAW_CSV_PATH = join(PROJECT_ROOT, 'data', 'raw.csv');
const PROCESSED_JSON_PATH = join(PROJECT_ROOT, 'data', 'processed.json');

async function main() {
  console.log('Processing raw data...');
  console.log(`Reading: ${RAW_CSV_PATH}`);
  
  try {
    // Read raw CSV
    const csvText = readFileSync(RAW_CSV_PATH, 'utf-8');
    
    // Parse and validate
    const dataPoints = parseRawCSV(csvText);
    console.log(`Parsed ${dataPoints.length} valid data points`);
    
    // Transform to final contract
    const processed = transformToProcessed(dataPoints);
    
    // Write processed JSON
    writeFileSync(
      PROCESSED_JSON_PATH,
      JSON.stringify(processed, null, 2),
      'utf-8'
    );
    
    console.log(`Wrote processed data to: ${PROCESSED_JSON_PATH}`);
    console.log('\n📈 Summary:');
    console.log(`  Years: ${processed.metadata.yearRange.min} - ${processed.metadata.yearRange.max}`);
    console.log(`  Records: ${processed.metadata.totalRecords}`);
    console.log(`  Total Military Spend: $${processed.summary.totalMilitarySpend}B`);
    console.log(`  Total Casualties: ${processed.summary.totalCasualties.toLocaleString()}`);
    console.log(`  Avg CPI Growth: ${processed.summary.avgCPIGrowth}% per year`);
    
  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
}

main();
