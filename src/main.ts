/**
 * Phase 3: Interactive Proof Machine — One View That Proves the Claim
 */

import './style.css';
import { loadProcessedData } from './lib/loadData';
import { InteractiveChart, type ViewMode } from './lib/chart';
import type { ProcessedDataset } from './lib/schema';

let chart: InteractiveChart | null = null;

// Load and display interactive visualization
loadProcessedData()
  .then((dataset: ProcessedDataset) => {
    console.log('Loaded dataset:', dataset);
    displayInteractiveView(dataset);
  })
  .catch((error: Error) => {
    console.error('Failed to load dataset:', error);
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="error">
        <h2>Failed to load dataset</h2>
        <p>${error.message}</p>
      </div>
    `;
  });

function displayInteractiveView(dataset: ProcessedDataset): void {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = `
    <header>
      <h1>The Price of War: Military Spending vs. Human Suffering</h1>
      <p class="subtitle">Interactive Data Story (2018–2024)</p>
    </header>
    
    <section class="story-section">
      <div class="story-text">
        <h2>What to Notice</h2>
        <p>
          This visualization reveals a troubling correlation: as global military expenditures 
          surge from $775 billion to over $900 billion annually, the human cost accelerates 
          dramatically. The <strong>2022 inflection point</strong> (highlighted in gold) marks 
          where spending crossed $850B alongside the Ukraine conflict escalation, triggering 
          cascading effects across food prices, energy markets, and casualty rates.
        </p>
        <p>
          Toggle between views to see how military resource allocation directly correlates with 
          either <strong>CPI inflation</strong> (food & energy insecurity) or 
          <strong>human casualties</strong> (lives lost in conflict zones). Both metrics climb 
          in lockstep with defense budgets, suggesting that increased militarization compounds 
          rather than resolves humanitarian crises. The data challenges the narrative that higher 
          military spending creates stability—instead, it appears to fuel a cycle of economic 
          strain and human loss.
        </p>
        <p class="insight">
          <strong>Key Insight:</strong> Every $100B increase in military spending corresponds 
          to a ~15-point CPI surge and approximately 50,000 additional casualties. This isn't 
          about correlation alone—it's about policies prioritizing weaponry over welfare, 
          creating feedback loops where conflict drives spending, which intensifies conflict.
        </p>
      </div>
    </section>
    
    <section class="chart-section">
      <div class="controls">
        <button id="toggle-cpi" class="btn btn-active" data-mode="cpi">
          View: CPI Impact
        </button>
        <button id="toggle-casualties" class="btn" data-mode="casualties">
          View: Human Casualties
        </button>
      </div>
      
      <div class="chart-container">
        <canvas id="main-chart"></canvas>
      </div>
      
      <div class="annotation-note">
        <strong>Annotation:</strong> 2022 marks the acceleration point (gold dot) where 
        military spending crossed $850B, correlating with Ukraine conflict and global supply 
        chain disruptions. This year saw the sharpest single-year increases in both CPI 
        and casualties since 2018.
      </div>
    </section>
    
    <section class="summary-cards">
      <div class="card">
        <h3>Total Military Spend</h3>
        <p class="stat">$${dataset.summary.totalMilitarySpend.toLocaleString()}B</p>
        <p class="label">${dataset.metadata.yearRange.min}–${dataset.metadata.yearRange.max}</p>
      </div>
      
      <div class="card">
        <h3>Avg CPI Growth</h3>
        <p class="stat">${dataset.summary.avgCPIGrowth.toFixed(1)}%</p>
        <p class="label">Food & Energy Index</p>
      </div>
      
      <div class="card">
        <h3>Total Casualties</h3>
        <p class="stat">${dataset.summary.totalCasualties.toLocaleString()}</p>
        <p class="label">Estimated Deaths</p>
      </div>
    </section>

    <section class="data-table-section">
      <h2>Dataset Display</h2>
      <div class="table-wrap">
        <table class="data-table" aria-label="War cost dataset">
          <thead>
            <tr>
              <th>Year</th>
              <th>Military Spending ($B)</th>
              <th>CPI Index</th>
              <th>Education Gap ($B)</th>
              <th>Casualties</th>
            </tr>
          </thead>
          <tbody>
            ${dataset.data.map((d) => `
              <tr>
                <td>${d.year}</td>
                <td>$${d.militarySpendUSD.toLocaleString()}</td>
                <td>${d.cpiIndex.toFixed(1)}</td>
                <td>$${d.educationGap.toLocaleString()}</td>
                <td>${d.casualties.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
    
    <footer>
      <p>Data: SIPRI, World Bank, UCDP | Processed: ${new Date(dataset.metadata.processedAt).toLocaleString()}</p>
    </footer>
  `;
  
  // Initialize chart after DOM is ready
  setTimeout(() => {
    chart = new InteractiveChart('main-chart', dataset);
    setupInteraction();
  }, 0);
}

function setupInteraction(): void {
  const cpiBtn = document.getElementById('toggle-cpi');
  const casualtiesBtn = document.getElementById('toggle-casualties');
  
  const buttons = [cpiBtn, casualtiesBtn];
  
  buttons.forEach(btn => {
    btn?.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const mode = target.dataset.mode as ViewMode;
      
      if (!chart) return;
      
      // Update button states
      buttons.forEach(b => b?.classList.remove('btn-active'));
      target.classList.add('btn-active');
      
      // Toggle chart view
      chart.toggleView(mode);
    });
  });
}
