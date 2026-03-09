/**
 * Phase 2 Schema & Contract
 * Defines the shape of data flowing through the application
 */

/**
 * Raw CSV row structure (as parsed from raw.csv)
 */
export interface RawDataRow {
  Year: string;
  Mil_Spend_USD_Billions: string;
  CPI_Food_Energy_Index: string;
  Edu_Funding_Gap_Billions: string;
  Casualties_Est: string;
  Source_Notes: string;
}

/**
 * Cleaned, typed data point
 * All values are validated and normalized
 */
export interface DataPoint {
  year: number;
  militarySpendUSD: number; // Billions
  cpiIndex: number; // Consumer Price Index (food + energy)
  educationGap: number; // Billions (opportunity cost proxy)
  casualties: number; // Estimated total conflict deaths
  sourceNotes: string;
}

/**
 * Processed dataset with metadata
 * This is the contract your UI can trust
 */
export interface ProcessedDataset {
  metadata: {
    processedAt: string; // ISO timestamp
    totalRecords: number;
    yearRange: {
      min: number;
      max: number;
    };
    dataQuality: {
      missingValues: number;
      interpolatedValues: number;
    };
  };
  data: DataPoint[];
  summary: {
    totalMilitarySpend: number; // Sum across all years (billions)
    avgCPIGrowth: number; // Average year-over-year % change
    totalCasualties: number; // Sum of all casualties
  };
}

/**
 * Configuration constants
 * No magic numbers - everything is named and explained
 */
export const DATA_CONFIG = {
  /**
   * Base year for CPI normalization (if needed in future phases)
   */
  CPI_BASE_YEAR: 2018,

  /**
   * Minimum valid year in dataset (sanity check)
   */
  MIN_VALID_YEAR: 2000,

  /**
   * Maximum valid year (current analysis window)
   */
  MAX_VALID_YEAR: 2030,

  /**
   * Threshold for flagging large year-over-year jumps (%)
   */
  ANOMALY_THRESHOLD_PCT: 50,
} as const;

/**
 * Validation helper: ensures data point is complete and within expected ranges
 */
export function validateDataPoint(point: DataPoint): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (point.year < DATA_CONFIG.MIN_VALID_YEAR || point.year > DATA_CONFIG.MAX_VALID_YEAR) {
    errors.push(`Year ${point.year} outside valid range`);
  }

  if (point.militarySpendUSD <= 0) {
    errors.push(`Invalid military spend: ${point.militarySpendUSD}`);
  }

  if (point.cpiIndex <= 0) {
    errors.push(`Invalid CPI: ${point.cpiIndex}`);
  }

  if (point.casualties < 0) {
    errors.push(`Negative casualties: ${point.casualties}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
