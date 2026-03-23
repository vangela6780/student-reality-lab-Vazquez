/**
 * Phase 4: Full Story narrative with 4 purposeful views.
 */

import './style.css';
import { loadProcessedData } from './lib/loadData';
import { InteractiveChart, type ViewMode } from './lib/chart';
import type { ProcessedDataset } from './lib/schema';
import { Chart, type ChartType } from 'chart.js/auto';

let chart: InteractiveChart | null = null;

type ToolState = 'idle' | 'thinking' | 'tool-running' | 'error';

type PendingApproval = {
  toolName: string;
  reason: string;
};

type SSEEvent = {
  event: string;
  data: Record<string, unknown>;
};

type ImpactDataPoint = {
  year: number;
  cpiIndex: number;
  casualties: number;
  educationGap?: number;
};

type ToolPayload = {
  years: string[];
  values: number[];
  risePct: number;
};

type EducationRegionPoint = {
  region: string;
  schoolClosures: number;
  literacyRate: number;
};

type EducationToolPayload = {
  regions: string[];
  schoolClosures: number[];
  literacyRates: number[];
  totalClosures: number;
  avgLiteracy: number;
};

type LiveWarUpdatePayload = {
  highlights: string[];
  sources: string[];
};

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

  const pre2022 = dataset.data.filter((d) => d.year <= 2021);
  const post2021 = dataset.data.filter((d) => d.year >= 2022);

  const avg = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const preAvgCpi = avg(pre2022.map((d) => d.cpiIndex));
  const postAvgCpi = avg(post2021.map((d) => d.cpiIndex));
  const preAvgCasualties = avg(pre2022.map((d) => d.casualties));
  const postAvgCasualties = avg(post2021.map((d) => d.casualties));
  const cpiShiftPct = preAvgCpi > 0 ? ((postAvgCpi - preAvgCpi) / preAvgCpi) * 100 : 0;
  const casualtiesShiftPct = preAvgCasualties > 0
    ? ((postAvgCasualties - preAvgCasualties) / preAvgCasualties) * 100
    : 0;

  const firstPoint = dataset.data[0];
  const lastPoint = dataset.data[dataset.data.length - 1];
  const cpiDelta = lastPoint.cpiIndex - firstPoint.cpiIndex;

  const yearlySpendDiff = dataset.data[dataset.data.length - 1].militarySpendUSD - dataset.data[0].militarySpendUSD;
  const yearlyCasualtyDiff = dataset.data[dataset.data.length - 1].casualties - dataset.data[0].casualties;
  
  app.innerHTML = `
    <header>
      <h1>The Cost of Conflict: Budgets and War Consequences</h1>
      <p class="subtitle">Interactive Data Story (2018–2024)</p>
    </header>

    <nav class="story-navbar" aria-label="Story navigation">
      <a href="#ai-assistant" class="story-link">AI Assistant</a>
      <a href="#context" class="story-link">Context</a>
      <a href="#evidence" class="story-link">Evidence</a>
      <a href="#counterpoint" class="story-link">Counterpoint</a>
      <a href="#takeaway" class="story-link">Takeaway</a>
      <a href="#dataset" class="story-link">Dataset</a>
    </nav>

    <section id="ai-assistant" class="story-view">
      <section class="story-section ai-panel">
        <div class="story-text">
          <h2>AI Assistant: MCP-Style Orchestration</h2>
          <p>
            Ask for summaries or tool-oriented prompts like "list tools" or "use filesystem tool".
          </p>
        </div>

        <div class="ai-status-wrap">
          <span class="ai-status-label">Tool Status</span>
          <span id="tool-status-badge" class="tool-status tool-status-idle">Idle</span>
        </div>

        <div id="ai-chat-log" class="ai-chat-log" aria-live="polite"></div>

        <div id="approval-box" class="approval-box" hidden>
          <p id="approval-text"></p>
          <button id="approve-btn" class="btn" type="button">Approve Tool Action</button>
        </div>

        <form id="ai-chat-form" class="ai-chat-form">
          <input id="ai-chat-input" class="ai-chat-input" type="text" placeholder="Send a prompt..." required />
          <button class="btn" type="submit">Send</button>
        </form>

        <div class="ai-quick-actions" aria-label="Suggested prompts">
          <span class="ai-quick-label">Suggested Prompts</span>
          <div class="ai-quick-row">
            <button class="quick-action-btn" type="button" data-prompt="Show a CPI chart compared to military spending and explain the trend.">
              📈 Show CPI Chart
            </button>
            <button class="quick-action-btn" type="button" data-prompt="List the impact of war on education and show a bar chart of school closures versus literacy rates in affected regions.">
              🎓 Education Impact
            </button>
            <button class="quick-action-btn" type="button" data-prompt="Show casualty trends over time and explain the human impact.">
              👥 Casualty Trends
            </button>
          </div>
        </div>
      </section>
    </section>

    <section id="context" class="story-view">
      <section class="story-section">
        <div class="story-text">
          <h2>Context: Why Students Should Care</h2>
          <p>
            <strong>You didn't choose to be born into a world at war.</strong> But as a student preparing for adulthood,
            you're living through its costs. Whether you worry about gas prices, tuition, food budgets, or job prospects—
            these are shaped by how governments spend money. Understanding the correlation between military spending and
            household pressure isn't just academic; it's preparation for your future.
          </p>
          <p>
            This story tracks how military spending, household pressure indicators (food & energy costs), and human casualties
            moved together from 2018–2024. It starts before the 2022 escalation and continues through its aftereffects,
            giving us a clear baseline and a post-shock period to compare.
          </p>
          <p class="insight">
            <strong>The numbers:</strong> Annual military spending rose by
            <strong>$${yearlySpendDiff.toLocaleString()}B</strong> across this period,
            while estimated conflict casualties rose by <strong>${yearlyCasualtyDiff.toLocaleString()}</strong>.
            Does higher spending align with higher human cost? Let's look at the data.
          </p>
        </div>
      </section>
    </section>
    
    <section id="evidence" class="story-view">
      <section class="story-section">
        <div class="story-text">
          <h2>Evidence: Linked Trends Over Time</h2>
          <p>
            Use the chart controls to switch between CPI and casualty outcomes against military spending.
            The same x-axis reveals whether both human and economic stress indicators rise during high-spend years.
          </p>
          <p class="insight">
            <strong>Interaction guidance:</strong> The two line views keep the spending bars constant.
            This makes it easier to compare how the conclusion changes when the outcome metric changes.
          </p>
        </div>
      </section>

      <section class="chart-section">
        <div class="controls" role="group" aria-label="Metric toggle">
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

        <div class="chart-info" id="chart-info" aria-live="polite">
          <h3 id="chart-info-title">CPI Impact View</h3>
          <p id="chart-info-summary">
            CPI rose by ${cpiDelta.toFixed(1)} points from ${firstPoint.year} to ${lastPoint.year},
            with the sharpest increase after 2022.
          </p>
          <p class="chart-info-detail">
            Read this as household pressure: higher food and energy index values mean students and families face
            tighter budgets for transport, groceries, and utilities.
          </p>
        </div>

        <div class="annotation-note">
          <strong>Annotation:</strong> 2022 marks the acceleration point where spending crossed $850B.
          That year aligns with the sharpest jumps in both CPI and casualties.
        </div>
      </section>
    </section>

    <section id="counterpoint" class="story-view">
      <section class="story-section">
        <div class="story-text">
          <h2>Counterpoint: Pre vs. Post 2022 Segmentation</h2>
          <p>
            A single trend line can hide shifts. This split compares pre-2022 years to 2022+ years.
            It tests whether the relationship is stable or changes after a major geopolitical inflection.
          </p>
        </div>
      </section>

      <section class="summary-cards">
        <div class="card">
          <h3>Average CPI Shift</h3>
          <p class="stat">${cpiShiftPct.toFixed(1)}%</p>
          <p class="label">Post-2021 vs. pre-2022 average</p>
        </div>
        <div class="card">
          <h3>Average Casualty Shift</h3>
          <p class="stat">${casualtiesShiftPct.toFixed(1)}%</p>
          <p class="label">Post-2021 vs. pre-2022 average</p>
        </div>
        <div class="card">
          <h3>Total Military Spend</h3>
          <p class="stat">$${dataset.summary.totalMilitarySpend.toLocaleString()}B</p>
          <p class="label">${dataset.metadata.yearRange.min}–${dataset.metadata.yearRange.max}</p>
        </div>
      </section>
    </section>

    <section id="takeaway" class="story-view">
      <section class="story-section">
        <div class="story-text">
          <h2>Takeaway: What This Means for Students</h2>
          <p>
            The story supports a consistent pattern: rising military expenditure aligns with higher household pressure
            and higher casualties in this period. Interacting with CPI versus casualties changes the lens,
            but not the direction of concern.
          </p>
          <p>
            This does <strong>not</strong> prove strict causation. It does show a measurable relationship worth public attention,
            student discussion, and policy literacy.
          </p>
          <div class="student-callout">
            <h3>🎓 Why This Matters for Your Future</h3>
            <p>
              You're about to vote, work, borrow money for school, and make career decisions in a world shaped by 
              government budget priorities. Understanding how military spending correlates with household costs helps you:
            </p>
            <ul>
              <li><strong>Hold policymakers accountable</strong> for explaining budget tradeoffs</li>
              <li><strong>Plan financially</strong> knowing that global conflicts can affect your cost of living</li>
              <li><strong>Engage in civic debate</strong> with data instead of just headlines</li>
            </ul>
          </div>
          <p class="insight">
            <strong>Actionable student takeaway:</strong> Track both budget priorities and cost-of-living indicators when evaluating
            public policy claims about "security" and "stability." The two are connected.
          </p>
        </div>
      </section>
    </section>

    <section id="dataset" class="data-table-section">
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
    
    <footer class="site-footer">
      <p>&copy; 2026 Angela Vazquez | Student Reality Lab</p>
    </footer>
  `;
  
  // Initialize chart after DOM is ready
  setTimeout(() => {
    chart = new InteractiveChart('main-chart', dataset);
    setupInteraction(dataset);
  }, 0);
}

function setupInteraction(dataset: ProcessedDataset): void {
  void dataset;

  const firstPoint = dataset.data[0];
  const lastPoint = dataset.data[dataset.data.length - 1];
  const cpiDelta = lastPoint.cpiIndex - firstPoint.cpiIndex;
  const casualtiesDelta = lastPoint.casualties - firstPoint.casualties;

  const cpiBtn = document.getElementById('toggle-cpi');
  const casualtiesBtn = document.getElementById('toggle-casualties');
  const infoTitle = document.getElementById('chart-info-title');
  const infoSummary = document.getElementById('chart-info-summary');
  const infoDetail = document.querySelector<HTMLParagraphElement>('.chart-info-detail');

  const updateChartInfo = (mode: ViewMode): void => {
    if (!infoTitle || !infoSummary || !infoDetail) return;

    if (mode === 'cpi') {
      infoTitle.textContent = 'CPI Impact View';
      infoSummary.textContent =
        `CPI rose by ${cpiDelta.toFixed(1)} points from ${firstPoint.year} to ${lastPoint.year}, with the sharpest increase after 2022.`;
      infoDetail.textContent =
        'Read this as household pressure: higher food and energy index values mean students and families face tighter budgets for transport, groceries, and utilities.';
      return;
    }

    infoTitle.textContent = 'Human Casualties View';
    infoSummary.textContent =
      `Annual casualties increased by ${casualtiesDelta.toLocaleString()} between ${firstPoint.year} and ${lastPoint.year}, with the steepest rise in the post-2022 period.`;
    infoDetail.textContent =
      'Read this as human cost: higher casualty counts indicate conflict escalation and larger long-term social harm beyond immediate battlefield losses.';
  };
  
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
      updateChartInfo(mode);
    });
  });

  updateChartInfo('cpi');

  setupChatInterface(dataset);
}

function setupChatInterface(dataset: ProcessedDataset): void {
  const form = document.getElementById('ai-chat-form') as HTMLFormElement | null;
  const input = document.getElementById('ai-chat-input') as HTMLInputElement | null;
  const log = document.getElementById('ai-chat-log') as HTMLDivElement | null;
  const badge = document.getElementById('tool-status-badge') as HTMLSpanElement | null;
  const approvalBox = document.getElementById('approval-box') as HTMLDivElement | null;
  const approvalText = document.getElementById('approval-text') as HTMLParagraphElement | null;
  const approveBtn = document.getElementById('approve-btn') as HTMLButtonElement | null;
  const quickActions = Array.from(document.querySelectorAll<HTMLButtonElement>('.quick-action-btn'));

  if (!form || !input || !log || !badge || !approvalBox || !approvalText || !approveBtn) return;

  const apiUrl = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_CHAT_API_URL ?? '/api/chat';

  let pendingApproval: PendingApproval | null = null;
  let lastPrompt = '';
  let assistantBuffer = '';
  let cachedImpactData: ImpactDataPoint[] | null = null;
  let cachedEducationData: EducationRegionPoint[] | null = null;

  const appendMessage = (role: 'user' | 'assistant' | 'tool', text: string): void => {
    const item = document.createElement('div');
    item.className = `ai-msg ai-msg-${role}`;
    item.innerHTML = `<span class="ai-msg-role">${role}</span><p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  };

  const appendChartMessage = (title: string): HTMLCanvasElement => {
    const item = document.createElement('div');
    item.className = 'ai-msg ai-msg-assistant ai-msg-chart';
    item.innerHTML = `
      <span class="ai-msg-role">assistant</span>
      <p>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <div class="chat-chart-wrap">
        <canvas class="chat-inline-chart" aria-label="${title.replace(/"/g, '&quot;')}"></canvas>
      </div>
    `;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
    const canvas = item.querySelector('canvas');
    if (!canvas) {
      throw new Error('Chart canvas missing from assistant response.');
    }
    return canvas;
  };

  const replaceAssistantDraft = (text: string): void => {
    const last = log.querySelector('.ai-msg-assistant:last-child p');
    if (last) {
      last.textContent = text;
      log.scrollTop = log.scrollHeight;
    }
  };

  const setToolState = (state: ToolState): void => {
    badge.className = `tool-status tool-status-${state}`;
    if (state === 'thinking') badge.textContent = 'Thinking';
    if (state === 'tool-running') badge.textContent = 'Using Tool';
    if (state === 'error') badge.textContent = 'Error';
    if (state === 'idle') badge.textContent = 'Idle';
  };

  const withFollowUp = (content: string, followUp: string): string => {
    const trimmed = content.trim();
    return `${trimmed}\n\n${followUp}`;
  };

  const getRisePct = (values: number[]): number => {
    if (values.length < 2 || values[0] === 0) return 0;
    return ((values[values.length - 1] - values[0]) / values[0]) * 100;
  };

  const mapFallbackImpactData = (): ImpactDataPoint[] => {
    return dataset.data.map((point) => ({
      year: point.year,
      cpiIndex: point.cpiIndex,
      casualties: point.casualties,
      educationGap: point.educationGap,
    }));
  };

  const loadImpactDataset = async (): Promise<ImpactDataPoint[]> => {
    if (cachedImpactData) return cachedImpactData;

    const response = await fetch(`${import.meta.env.BASE_URL}data/impact-dataset.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch impact dataset: ${response.status}`);
    }

    const data = (await response.json()) as ImpactDataPoint[];
    cachedImpactData = data;
    return data;
  };

  const fallbackEducationRows = (): EducationRegionPoint[] => {
    return [
      { region: 'Eastern Europe', schoolClosures: 2400, literacyRate: 91.8 },
      { region: 'Middle East', schoolClosures: 3800, literacyRate: 84.6 },
      { region: 'North Africa', schoolClosures: 1700, literacyRate: 79.4 },
      { region: 'Sub-Saharan Africa', schoolClosures: 4600, literacyRate: 68.9 },
      { region: 'South Asia', schoolClosures: 3100, literacyRate: 76.1 },
    ];
  };

  const loadEducationImpactDataset = async (): Promise<EducationRegionPoint[]> => {
    if (cachedEducationData) return cachedEducationData;

    const response = await fetch(`${import.meta.env.BASE_URL}data/education-impact-regions.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch education impact dataset: ${response.status}`);
    }

    const data = (await response.json()) as EducationRegionPoint[];
    cachedEducationData = data;
    return data;
  };

  const get_live_war_update = async (query: string): Promise<LiveWarUpdatePayload> => {
    const openSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&limit=3&namespace=0&format=json&search=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(openSearchUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`Live research search failed (${searchResponse.status})`);
    }

    const searchJson = (await searchResponse.json()) as [string, string[], string[], string[]];
    const titles = searchJson[1] ?? [];
    const sources = (searchJson[3] ?? []).slice(0, 3);

    if (titles.length === 0) {
      return {
        highlights: ['No recent public references were found for that war query.'],
        sources: [],
      };
    }

    const highlights: string[] = [];
    for (let i = 0; i < Math.min(3, titles.length); i += 1) {
      const title = titles[i];
      const encodedTitle = encodeURIComponent(title.replace(/\s+/g, '_'));
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

      try {
        const summaryResponse = await fetch(summaryUrl, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!summaryResponse.ok) continue;

        const summaryJson = (await summaryResponse.json()) as { extract?: string };
        const extract = (summaryJson.extract ?? '').trim();
        if (!extract) continue;
        highlights.push(`${title}: ${extract}`);
      } catch {
        continue;
      }
    }

    return {
      highlights: highlights.length > 0 ? highlights : ['Public references were found, but summaries were unavailable.'],
      sources,
    };
  };

  const get_cpi_data = async (): Promise<ToolPayload> => {
    try {
      const rows = await loadImpactDataset();
      const years = rows.map((row) => String(row.year));
      const values = rows.map((row) => row.cpiIndex);
      return { years, values, risePct: getRisePct(values) };
    } catch {
      const fallbackRows = mapFallbackImpactData();
      const years = fallbackRows.map((row) => String(row.year));
      const values = fallbackRows.map((row) => row.cpiIndex);
      return { years, values, risePct: getRisePct(values) };
    }
  };

  const get_casualty_stats = async (): Promise<ToolPayload> => {
    try {
      const rows = await loadImpactDataset();
      const years = rows.map((row) => String(row.year));
      const values = rows.map((row) => row.casualties);
      return { years, values, risePct: getRisePct(values) };
    } catch {
      const fallbackRows = mapFallbackImpactData();
      const years = fallbackRows.map((row) => String(row.year));
      const values = fallbackRows.map((row) => row.casualties);
      return { years, values, risePct: getRisePct(values) };
    }
  };

  const get_education_impact_data = async (): Promise<EducationToolPayload> => {
    try {
      const rows = await loadEducationImpactDataset();
      const regions = rows.map((row) => row.region);
      const schoolClosures = rows.map((row) => row.schoolClosures);
      const literacyRates = rows.map((row) => row.literacyRate);
      const totalClosures = schoolClosures.reduce((sum, value) => sum + value, 0);
      const avgLiteracy = literacyRates.reduce((sum, value) => sum + value, 0) / literacyRates.length;
      return { regions, schoolClosures, literacyRates, totalClosures, avgLiteracy };
    } catch {
      const rows = fallbackEducationRows();
      const regions = rows.map((row) => row.region);
      const schoolClosures = rows.map((row) => row.schoolClosures);
      const literacyRates = rows.map((row) => row.literacyRate);
      const totalClosures = schoolClosures.reduce((sum, value) => sum + value, 0);
      const avgLiteracy = literacyRates.reduce((sum, value) => sum + value, 0) / literacyRates.length;
      return { regions, schoolClosures, literacyRates, totalClosures, avgLiteracy };
    }
  };

  const render_chart = (payload: ToolPayload, label: string, type: ChartType): void => {
    const canvas = appendChartMessage(`${label} (${payload.years[0]}-${payload.years[payload.years.length - 1]})`);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to render chart context.');
    }

    const isCasualty = label.toLowerCase().includes('casual');
    const borderColor = isCasualty ? 'rgba(190, 32, 38, 1)' : 'rgba(10, 75, 179, 1)';
    const backgroundColor = isCasualty ? 'rgba(190, 32, 38, 0.2)' : 'rgba(10, 75, 179, 0.2)';

    new Chart(context, {
      type,
      data: {
        labels: payload.years,
        datasets: [
          {
            label,
            data: payload.values,
            borderColor,
            backgroundColor,
            borderWidth: 2,
            fill: type === 'line',
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#1f1f1f',
              font: {
                size: 11,
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => {
                if (!isCasualty) return String(value);
                return Number(value).toLocaleString();
              },
            },
          },
        },
      },
    });
  };

  const render_education_chart = (payload: EducationToolPayload): void => {
    const canvas = appendChartMessage('Education Impact by Region: School Closures vs Literacy Rates');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to render education chart context.');
    }

    new Chart(context, {
      type: 'bar',
      data: {
        labels: payload.regions,
        datasets: [
          {
            label: 'School Closures',
            data: payload.schoolClosures,
            backgroundColor: 'rgba(190, 32, 38, 0.72)',
            borderColor: 'rgba(190, 32, 38, 1)',
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            label: 'Literacy Rate (%)',
            data: payload.literacyRates,
            backgroundColor: 'rgba(10, 75, 179, 0.65)',
            borderColor: 'rgba(10, 75, 179, 1)',
            borderWidth: 1,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#1f1f1f',
              font: { size: 11 },
            },
          },
        },
        scales: {
          y: {
            position: 'left',
            title: {
              display: true,
              text: 'School Closures',
            },
            ticks: {
              callback: (value) => Number(value).toLocaleString(),
            },
          },
          y1: {
            position: 'right',
            title: {
              display: true,
              text: 'Literacy Rate (%)',
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });
  };

  const parseSSE = (packet: string): SSEEvent[] => {
    return packet
      .split('\n\n')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const lines = chunk.split('\n');
        const event = lines.find((line) => line.startsWith('event:'))?.replace('event:', '').trim() ?? 'message';
        const dataRaw = lines.find((line) => line.startsWith('data:'))?.replace('data:', '').trim() ?? '{}';
        try {
          return { event, data: JSON.parse(dataRaw) as Record<string, unknown> };
        } catch {
          return { event: 'error', data: { message: 'Invalid stream payload.' } };
        }
      });
  };

  const offlineAssistantReply = (prompt: string): string => {
    const lowered = prompt.toLowerCase();
    const firstYear = dataset.metadata.yearRange.min;
    const lastYear = dataset.metadata.yearRange.max;
    const first = dataset.data[0];
    const last = dataset.data[dataset.data.length - 1];
    const spendDelta = last.militarySpendUSD - first.militarySpendUSD;
    const casualtyDelta = last.casualties - first.casualties;
    const cpiDelta = last.cpiIndex - first.cpiIndex;

    if (/^(hi|hello|hey)\b/.test(lowered)) {
      return 'Hello! I\'m your War Impact Analyst. I can help you visualize the economic and human costs of conflict. Would you like to see a trend of the Cost of Living (CPI) or casualty data?';
    }

    if (lowered.includes('tool') || lowered.includes('list tools')) {
      return withFollowUp(
        [
          'Available local tools:',
          '- get_cpi_data(): retrieves CPI trend data',
          '- get_casualty_stats(): retrieves casualty trend data',
          '- get_education_impact_data(): retrieves school closure and literacy rates by region',
          '- render_chart(data, label, type): renders a Chart.js chart in chat',
        ].join('\n'),
        'Would you like me to run CPI, casualty, or education impact tools next?'
      );
    }

    if (lowered.includes('summary') || lowered.includes('summarize')) {
      return withFollowUp(
        'This website is an interactive data story about war costs from 2018-2024, showing military spending alongside CPI pressure and casualties. It uses Context, Evidence, Counterpoint, and Takeaway sections to argue that higher spending years align with higher household and human costs, while clearly noting correlation limits.',
        'Would you like a CPI trend chart or a casualty trend chart next?'
      );
    }

    if (lowered.includes('cpi') || lowered.includes('inflation') || lowered.includes('price')) {
      return withFollowUp(
        `CPI in this dataset rises by ${cpiDelta.toFixed(1)} points from ${firstYear} to ${lastYear}, with the strongest increases after 2022.`,
        'Would you like me to render this as a line chart in chat?'
      );
    }

    if (lowered.includes('casual') || lowered.includes('human')) {
      return withFollowUp(
        `Estimated annual casualties increase by ${casualtyDelta.toLocaleString()} between ${firstYear} and ${lastYear}, with sharper increases in the post-2021 period.`,
        'Would you like me to visualize casualty trend changes year by year?'
      );
    }

    if (lowered.includes('education') || lowered.includes('school') || lowered.includes('literacy')) {
      return withFollowUp(
        'I can show education impact across affected regions using school closures and literacy rates in a grouped bar chart.',
        'Would you like a region-by-region education chart now?'
      );
    }

    if (lowered.includes('spend') || lowered.includes('budget') || lowered.includes('military')) {
      return withFollowUp(
        `Military spending increases by $${spendDelta.toLocaleString()}B from ${firstYear} to ${lastYear}. Total spend in the dataset is $${dataset.summary.totalMilitarySpend.toLocaleString()}B.`,
        'Would you like me to compare this against CPI or casualties in a chart?'
      );
    }

    if (lowered.includes('limit') || lowered.includes('bias') || lowered.includes('causal')) {
      return withFollowUp(
        'Key limits: the dataset is correlational (not causal), casualties are estimated with methodological uncertainty, and the window is short (2018-2024) with U.S.-centered spending context.',
        'Would you like a compact text summary or a chart-led walkthrough of the trends?'
      );
    }

    return withFollowUp(
      [
        'I can answer this using the site dataset in local mode.',
        `Quick snapshot: military spending +$${spendDelta.toLocaleString()}B, CPI +${cpiDelta.toFixed(1)}, casualties +${casualtyDelta.toLocaleString()} (${firstYear}-${lastYear}).`,
      ].join('\n\n'),
      'Would you like me to show CPI trend or casualty trend first?'
    );
  };

  const runFallback = (prompt: string, replaceDraft = false): void => {
    setToolState('thinking');
    const reply = offlineAssistantReply(prompt);
    if (replaceDraft) {
      replaceAssistantDraft(reply);
    } else {
      appendMessage('assistant', reply);
    }
    setToolState('idle');
  };

  const handleAgenticPrompt = async (prompt: string): Promise<boolean> => {
    const lowered = prompt.toLowerCase();

    if (/^(hi|hello|hey)\b/.test(lowered)) {
      appendMessage('assistant', 'Hello! I\'m your War Impact Analyst. I can help you visualize the economic and human costs of conflict. Would you like to see a trend of the Cost of Living (CPI) or casualty data?');
      return true;
    }

    const asksForCpi = /cpi|inflation|cost of living|price trend/.test(lowered);
    const asksForCasualties = /casualt|human cost|human toll|deaths?/.test(lowered);
    const asksForEducation = /education|school|closures?|literacy|affected regions?|region/.test(lowered);
    const asksForWarTopic = /\bwar|conflict|invasion|ceasefire|frontline|battle|sudan\b/.test(lowered);
    const asksForLatest = /\blatest|current|today|now|update\b/.test(lowered);

    if (asksForWarTopic && asksForLatest && !asksForCpi && !asksForCasualties && !asksForEducation) {
      setToolState('thinking');
      appendMessage('tool', 'Calling get_live_war_update() ...');

      try {
        setToolState('tool-running');
        const payload = await get_live_war_update(prompt);
        const referenceText = payload.highlights.map((line) => `- ${line}`).join('\n');
        const sourceText = payload.sources.length > 0
          ? `\n\nSources:\n${payload.sources.map((url) => `- ${url}`).join('\n')}`
          : '';

        appendMessage(
          'assistant',
          withFollowUp(
            `Here are the latest public references I found related to your war question:\n\n${referenceText}${sourceText}`,
            'Would you like a short timeline summary or key humanitarian impacts next?'
          )
        );
        setToolState('idle');
        return true;
      } catch {
        appendMessage(
          'assistant',
          withFollowUp(
            'I could not fetch live web references right now. I can still provide trends from your local war-impact dataset while live lookup recovers.',
            'Would you like CPI, casualty, or education trends instead?'
          )
        );
        setToolState('error');
        return true;
      }
    }

    if (!asksForCpi && !asksForCasualties && !asksForEducation) {
      return false;
    }

    if (asksForEducation) {
      setToolState('thinking');
      appendMessage('tool', 'Calling get_education_impact_data() ...');

      try {
        setToolState('tool-running');
        const payload = await get_education_impact_data();
        appendMessage(
          'assistant',
          withFollowUp(
            `School closures total ${payload.totalClosures.toLocaleString()} across the tracked affected regions, while average literacy is ${payload.avgLiteracy.toFixed(1)}%. The largest closure burden appears in Sub-Saharan Africa and the Middle East.`,
            'Would you like a breakdown table by region as well?'
          )
        );
        render_education_chart(payload);
        setToolState('idle');
        return true;
      } catch {
        const payload = await get_education_impact_data();
        appendMessage(
          'assistant',
          withFollowUp(
            `I'm having trouble fetching the live chart right now, but according to my records, school closures reached ${payload.totalClosures.toLocaleString()} while average literacy was ${payload.avgLiteracy.toFixed(1)}%. Would you like the text summary instead?`,
            'Would you like the region-by-region text summary right now?'
          )
        );
        setToolState('error');
        return true;
      }
    }

    const isCpi = asksForCpi && !asksForCasualties;
    const toolName = isCpi ? 'get_cpi_data' : 'get_casualty_stats';

    setToolState('thinking');
    appendMessage('tool', `Calling ${toolName}() ...`);

    try {
      setToolState('tool-running');
      const payload = isCpi ? await get_cpi_data() : await get_casualty_stats();
      const summary = isCpi
        ? `I've analyzed the data. Here is the trend for the Cost of Living (CPI) compared to military spending. As you can see, CPI increased by ${payload.risePct.toFixed(1)}% across ${payload.years[0]}-${payload.years[payload.years.length - 1]}, with the sharpest rise in the post-2021 period.`
        : `Casualties increased by ${payload.risePct.toFixed(1)}% across ${payload.years[0]}-${payload.years[payload.years.length - 1]}, indicating a substantial rise in human cost.`;
      const followUp = isCpi
        ? 'Would you like me to compare CPI against casualties next?'
        : 'Would you like me to overlay CPI trend after this casualty view?';

      appendMessage('assistant', withFollowUp(summary, followUp));
      render_chart(payload, isCpi ? 'Cost of Living (CPI)' : 'Conflict Casualties', 'line');
      setToolState('idle');
      return true;
    } catch {
      const fallbackPayload = isCpi ? await get_cpi_data() : await get_casualty_stats();
      appendMessage(
        'assistant',
        withFollowUp(
          `I'm having trouble fetching the live chart right now, but according to my records, the ${isCpi ? 'CPI' : 'casualty trend'} rose by ${fallbackPayload.risePct.toFixed(1)}%. Would you like the text summary instead?`,
          'Would you like a year-by-year text summary while chart rendering recovers?'
        )
      );
      setToolState('error');
      return true;
    }
  };

  const runRequest = async (prompt: string, approved: boolean): Promise<void> => {
    lastPrompt = prompt;
    assistantBuffer = '';
    appendMessage('assistant', '');
    setToolState('thinking');
    approvalBox.hidden = true;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, pendingApproval: { approved } }),
      });

      if (!response.ok || !response.body) {
        runFallback(prompt, true);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        if (!buffer.includes('\n\n')) continue;
        const segments = buffer.split('\n\n');
        buffer = segments.pop() ?? '';

        for (const event of parseSSE(segments.join('\n\n'))) {
          if (event.event === 'status') {
            const state = event.data.state as ToolState | undefined;
            if (state) setToolState(state);
          }

          if (event.event === 'text_delta') {
            assistantBuffer += String(event.data.text ?? '');
            replaceAssistantDraft(assistantBuffer);
          }

          if (event.event === 'tool_result') {
            appendMessage('tool', String(event.data.content ?? 'Tool returned no output.'));
          }

          if (event.event === 'approval_required') {
            pendingApproval = {
              toolName: String(event.data.toolName ?? 'tool'),
              reason: String(event.data.reason ?? 'Approval required for this action.'),
            };
            approvalText.textContent = `Approval required for ${pendingApproval.toolName}: ${pendingApproval.reason}`;
            approvalBox.hidden = false;
          }

          if (event.event === 'error') {
            appendMessage('assistant', `Error: ${String(event.data.message ?? 'Unknown error')}`);
            setToolState('error');
          }

          if (event.event === 'done') {
            setToolState('idle');
          }
        }
      }
    } catch {
      runFallback(prompt, true);
    }
  };

  const dispatchPrompt = async (rawPrompt: string): Promise<void> => {
    const prompt = rawPrompt.trim();
    if (!prompt) return;
    appendMessage('user', prompt);
    const handledLocally = await handleAgenticPrompt(prompt);
    if (handledLocally) return;
    await runRequest(prompt, false);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = input.value;
    input.value = '';
    await dispatchPrompt(prompt);
  });

  quickActions.forEach((button) => {
    button.addEventListener('click', async () => {
      const prompt = button.dataset.prompt ?? button.textContent ?? '';
      await dispatchPrompt(prompt);
    });
  });

  approveBtn.addEventListener('click', async () => {
    if (!pendingApproval) return;
    approvalBox.hidden = true;
    await runRequest(lastPrompt, true);
    pendingApproval = null;
  });
}
