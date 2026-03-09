/**
 * Phase 2 Data Loading & Transform Module
 * Converts raw CSV into clean, typed, validated JSON
 */

import type { DataPoint, ProcessedDataset } from './schema';
import { validateDataPoint } from './schema';

/**
 * Load and parse processed data
 * In production, this would fetch from /data/processed.json
 * For now, we import it directly (generated at build time)
 */
export async function loadProcessedData(): Promise<ProcessedDataset> {
  try {
    // Dynamic import of processed data
    const response = await fetch(`${import.meta.env.BASE_URL}data/processed.json`);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const dataset: ProcessedDataset = await response.json();
    return dataset;
  } catch (error) {
    console.error('Error loading processed data:', error);
    throw error;
  }
}

/**
 * Parse raw CSV text into structured data points
 * This is used by the build-time processor
 */
export function parseRawCSV(csvText: string): DataPoint[] {
  const lines = csvText.trim().split('\n');
  // Skip headers
  lines.shift();
  
  const dataPoints: DataPoint[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < 6) {
      console.warn(`Skipping malformed line ${i + 1}`);
      continue;
    }
    
    const point: DataPoint = {
      year: parseInt(values[0], 10),
      militarySpendUSD: parseFloat(values[1]),
      cpiIndex: parseFloat(values[2]),
      educationGap: parseFloat(values[3]),
      casualties: parseInt(values[4], 10),
      sourceNotes: values[5].replace(/"/g, ''), // Remove quotes
    };
    
    const validation = validateDataPoint(point);
    if (!validation.valid) {
      console.warn(`Invalid data point at line ${i + 1}:`, validation.errors);
      continue;
    }
    
    dataPoints.push(point);
  }
  
  return dataPoints;
}

/**
 * Parse a single CSV line, respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Generate summary statistics from data points
 */
export function generateSummary(data: DataPoint[]) {
  const totalMilitarySpend = data.reduce((sum, d) => sum + d.militarySpendUSD, 0);
  const totalCasualties = data.reduce((sum, d) => sum + d.casualties, 0);
  
  // Calculate average CPI growth (year-over-year % change)
  let cpiGrowthSum = 0;
  for (let i = 1; i < data.length; i++) {
    const growth = ((data[i].cpiIndex - data[i - 1].cpiIndex) / data[i - 1].cpiIndex) * 100;
    cpiGrowthSum += growth;
  }
  const avgCPIGrowth = data.length > 1 ? cpiGrowthSum / (data.length - 1) : 0;
  
  return {
    totalMilitarySpend: Math.round(totalMilitarySpend * 100) / 100,
    avgCPIGrowth: Math.round(avgCPIGrowth * 100) / 100,
    totalCasualties,
  };
}

/**
 * Transform raw data into the final processed dataset contract
 */
export function transformToProcessed(data: DataPoint[]): ProcessedDataset {
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  const years = sortedData.map(d => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  return {
    metadata: {
      processedAt: new Date().toISOString(),
      totalRecords: sortedData.length,
      yearRange: { min: minYear, max: maxYear },
      dataQuality: {
        missingValues: 0, // Update if we implement gap detection
        interpolatedValues: 0, // Update if we implement interpolation
      },
    },
    data: sortedData,
    summary: generateSummary(sortedData),
  };
}
