/**
 * Phase 3: Interactive Chart Component
 * Dual-axis visualization with toggle interaction
 */

import {
  Chart,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js';
import type { ProcessedDataset } from './schema';

// Register Chart.js components
Chart.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type ViewMode = 'cpi' | 'casualties';

export class InteractiveChart {
  private chart: Chart | null = null;
  private dataset: ProcessedDataset;
  private viewMode: ViewMode = 'cpi';

  constructor(canvasId: string, dataset: ProcessedDataset) {
    this.dataset = dataset;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element #${canvasId} not found`);
    }

    this.render(canvas);
  }

  private render(canvas: HTMLCanvasElement) {
    const years = this.dataset.data.map(d => d.year.toString());
    const militarySpend = this.dataset.data.map(d => d.militarySpendUSD);
    const cpiData = this.dataset.data.map(d => d.cpiIndex);
    const casualtiesData = this.dataset.data.map(d => d.casualties / 1000); // Scale to thousands

    const ctx = canvas.getContext('2d')!;

    // Annotation: 2022 shows sharp acceleration
    const annotationYear = 2022;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            type: 'bar' as const,
            label: 'Military Spending ($B)',
            data: militarySpend,
            backgroundColor: 'rgba(10, 75, 179, 0.6)',
            borderColor: 'rgba(10, 75, 179, 1)',
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            type: 'line' as const,
            label: this.viewMode === 'cpi' ? 'CPI Food & Energy Index' : 'Casualties (thousands)',
            data: this.viewMode === 'cpi' ? cpiData : casualtiesData,
            backgroundColor: 'rgba(190, 32, 38, 0.15)',
            borderColor: 'rgba(190, 32, 38, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: years.map((y) => 
              parseInt(y) === annotationYear ? 'rgba(245, 183, 0, 1)' : 'rgba(190, 32, 38, 1)'
            ),
            pointBorderColor: '#f3f0e7',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Military Spending vs. Human Cost (2018-2024)',
            color: '#111111',
            font: { size: 18, weight: 'bold' },
            padding: 20,
          },
          legend: {
            display: true,
            labels: {
              color: '#1e1e1e',
              font: { size: 13 },
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(17, 17, 17, 0.95)',
            titleColor: '#f7f4ed',
            bodyColor: '#f7f4ed',
            borderColor: 'rgba(245, 183, 0, 0.9)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              afterLabel: (context: TooltipItem<'bar'>) => {
                if (parseInt(String(context.label), 10) === annotationYear && context.datasetIndex === 1) {
                  return 'Sharp acceleration point';
                }
                return '';
              },
            },
          },
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Year', 
              color: '#1e1e1e',
              font: { size: 14, weight: 'bold' },
            },
            ticks: { color: '#2f2f2f' },
            grid: { color: 'rgba(17, 17, 17, 0.08)' },
          },
          y: {
            type: 'linear',
            position: 'left',
            title: { 
              display: true, 
              text: 'Military Spending (Billions USD)', 
              color: 'rgba(10, 75, 179, 1)',
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              color: 'rgba(10, 75, 179, 1)',
              callback: (value: string | number) => '$' + value + 'B',
            },
            grid: { color: 'rgba(17, 17, 17, 0.08)' },
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: this.viewMode === 'cpi' 
                ? 'CPI Food & Energy Index' 
                : 'Casualties (thousands)',
              color: 'rgba(190, 32, 38, 1)',
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              color: 'rgba(190, 32, 38, 1)',
              callback: (value: string | number) => this.viewMode === 'cpi' ? value.toString() : value + 'k',
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  public toggleView(mode: ViewMode) {
    if (this.viewMode === mode || !this.chart) return;
    
    this.viewMode = mode;
    
    const newData = this.viewMode === 'cpi' 
      ? this.dataset.data.map(d => d.cpiIndex)
      : this.dataset.data.map(d => d.casualties / 1000);
    
    const newLabel = this.viewMode === 'cpi' 
      ? 'CPI Food & Energy Index' 
      : 'Casualties (thousands)';
    
    const newAxisTitle = this.viewMode === 'cpi'
      ? 'CPI Food & Energy Index'
      : 'Casualties (thousands)';

    // Update dataset
    this.chart.data.datasets[1].data = newData;
    this.chart.data.datasets[1].label = newLabel;
    
    // Update axis title
    if (this.chart.options.scales?.y1 && 'title' in this.chart.options.scales.y1 && this.chart.options.scales.y1.title) {
      this.chart.options.scales.y1.title.text = newAxisTitle;
    }
    
    // Update tick callback for casualties mode
    if (this.chart.options.scales?.y1 && 'ticks' in this.chart.options.scales.y1 && this.chart.options.scales.y1.ticks) {
      this.chart.options.scales.y1.ticks.callback = (value: string | number) => 
        this.viewMode === 'cpi' ? value.toString() : value + 'k';
    }
    
    this.chart.update('active');
  }

  public destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
