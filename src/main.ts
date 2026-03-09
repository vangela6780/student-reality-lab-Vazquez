/**
 * Main application entry point
 * Phase 2: Load and display processed data
 */

import './style.css';
import { loadProcessedData } from './lib/loadData';
import type { ProcessedDataset } from './lib/schema';

async function initApp() {
  try {
    console.log('🚀 Loading processed data...');
    const dataset: ProcessedDataset = await loadProcessedData();
    
    console.log('✅ Data loaded:', dataset.metadata);
    
    // Render summary cards
    renderSummaryCards(dataset);
    
    // Render data table
    renderDataTable(dataset);
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    document.getElementById('summary-cards')!.innerHTML = 
      '<div class="card error">Failed to load data. See console for details.</div>';
  }
}

function renderSummaryCards(dataset: ProcessedDataset) {
  const container = document.getElementById('summary-cards')!;
  
  container.innerHTML = `
    <div class="card">
      <h3>Total Military Spending</h3>
      <p class="metric">$${dataset.summary.totalMilitarySpend.toLocaleString()}B</p>
      <p class="label">${dataset.metadata.yearRange.min}–${dataset.metadata.yearRange.max}</p>
    </div>
    
    <div class="card">
      <h3>Avg CPI Growth</h3>
      <p class="metric">${dataset.summary.avgCPIGrowth}%</p>
      <p class="label">Per year (food + energy)</p>
    </div>
    
    <div class="card">
      <h3>Total Casualties</h3>
      <p class="metric">${dataset.summary.totalCasualties.toLocaleString()}</p>
      <p class="label">Estimated deaths</p>
    </div>
    
    <div class="card">
      <h3>Data Points</h3>
      <p class="metric">${dataset.metadata.totalRecords}</p>
      <p class="label">Years analyzed</p>
    </div>
  `;
}

function renderDataTable(dataset: ProcessedDataset) {
  const tbody = document.querySelector('#data-display tbody')!;
  
  tbody.innerHTML = dataset.data.map(d => `
    <tr>
      <td>${d.year}</td>
      <td>$${d.militarySpendUSD.toLocaleString()}</td>
      <td>${d.cpiIndex.toFixed(1)}</td>
      <td>$${d.educationGap.toLocaleString()}</td>
      <td>${d.casualties.toLocaleString()}</td>
    </tr>
  `).join('');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
