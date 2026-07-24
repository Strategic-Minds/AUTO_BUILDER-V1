'use client';

import { useEffect } from 'react';

const dashboardMarkup = String.raw`<div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="brand-block"><div class="brand-mark" aria-label="XAB Xtreme Auto Builder"><div class="brand-x"><span></span><span></span></div><div class="brand-name">XAB</div><div class="brand-sub">XTREME AUTO BUILDER</div></div></div>

      <nav class="nav-list">
        <button class="nav-item active" data-section="Overview"><span class="nav-icon database">◫</span><span>OVERVIEW</span></button>
        <button class="nav-item" data-section="Database Health"><span class="nav-icon">◉</span><span>DATABASE HEALTH</span></button>
        <button class="nav-item" data-section="Schema & RLS"><span class="nav-icon">◉</span><span>SCHEMA &amp; RLS</span></button>
        <button class="nav-item" data-section="Pipelines & Queues"><span class="nav-icon">⌘</span><span>PIPELINES &amp; QUEUES</span></button>
        <button class="nav-item" data-section="Artifacts & Bridge"><span class="nav-icon">▱</span><span>ARTIFACTS &amp; BRIDGE</span></button>
        <button class="nav-item" data-section="Approvals"><span class="nav-icon">▧</span><span>APPROVALS</span></button>
        <button class="nav-item" data-section="Validations"><span class="nav-icon">☑</span><span>VALIDATIONS</span></button>
        <button class="nav-item" data-section="Repairs & Hardening"><span class="nav-icon">⌕</span><span>REPAIRS &amp; HARDENING</span></button>
        <button class="nav-item" data-section="Agents & Swarm"><span class="nav-icon">⚭</span><span>AGENTS &amp; SWARM</span></button>
        <button class="nav-item" data-section="MCP Registry"><span class="nav-icon">⌁</span><span>MCP REGISTRY</span></button>
        <button class="nav-item" data-section="Monitoring"><span class="nav-icon">▥</span><span>MONITORING</span></button>
        <button class="nav-item" data-section="Activity & Logs"><span class="nav-icon">▤</span><span>ACTIVITY &amp; LOGS</span></button>
        <button class="nav-item" data-section="Security"><span class="nav-icon">♢</span><span>SECURITY</span></button>
        <button class="nav-item" data-section="Settings"><span class="nav-icon">⚙</span><span>SETTINGS</span></button>
      </nav>

      <div class="operator-card">
        <div class="operator-row">
          <span class="operator-lock">▣</span>
          <div><strong>XAB OPERATOR</strong><span>Strategic-Minds</span></div>
          <span class="owner-pill">OWNER</span>
        </div>
        <div class="online"><span></span>ONLINE</div>
      </div>
      <div class="sidebar-footer-art" aria-hidden="true"></div>
    </aside>

    <main class="main">
      <div class="top-rail"><span class="rail-left"></span><span class="rail-center"></span><span class="rail-right"></span></div>
      <header class="topbar">
        <div class="title-wrap">
          <h1><span>XAB</span> <small>SUPABASE COMMAND CENTER</small></h1>
          <div class="project-line">Project: azajysheebfhyzoyplpf <span class="health-dot"></span><strong>ACTIVE_HEALTHY</strong></div>
        </div>
        <div class="top-actions">
          <label class="search-box">
            <input id="globalSearch" type="search" placeholder="Search everything..." />
            <span class="search-icon"></span>
          </label>
          <button class="circle-action bell" aria-label="Notifications"><span>♧</span><b>3</b></button>
          <button class="circle-action" aria-label="Pulse">⌁</button>
          <button class="circle-action" aria-label="Theme">☼</button>
          <button class="range-button" id="rangeButton">LAST 24 HOURS <span>⌄</span></button>
          <button class="avatar-button" aria-label="Profile"><span class="mini-x" aria-hidden="true"></span></button>
        </div>
      </header>

      <section class="content" aria-label="Command center overview">
        <div class="metric-grid searchable-zone">
          <article class="metric-card">
            <div class="metric-icon heart">♡</div>
            <div class="metric-copy"><span>PROJECT HEALTH</span><strong>ACTIVE_HEALTHY</strong><small>System operational</small></div>
            <svg class="spark" viewBox="0 0 240 34"><polyline points="0,28 18,25 36,20 52,22 71,18 88,21 105,11 121,17 142,18 158,26 175,14 191,17 208,6 226,12 240,5"/></svg>
          </article>
          <article class="metric-card">
            <div class="metric-icon stack">◎</div>
            <div class="metric-copy"><span>TOTAL TABLES</span><strong>287</strong><small>+19 since last run</small></div>
            <svg class="spark" viewBox="0 0 240 34"><polyline points="0,26 20,21 40,23 58,21 74,22 90,16 106,20 124,11 140,24 158,17 176,6 193,16 210,2 226,12 240,11"/></svg>
          </article>
          <article class="metric-card">
            <div class="metric-icon cube">◇</div>
            <div class="metric-copy"><span>MIGRATIONS</span><strong>1</strong><small>Since golden_path_pipeline</small></div>
            <svg class="spark" viewBox="0 0 240 34"><polyline points="0,26 20,22 38,20 56,23 72,17 90,23 108,14 124,22 142,11 160,20 180,8 198,1 216,10 232,6 240,8"/></svg>
          </article>
          <article class="metric-card">
            <div class="metric-icon shield">♢</div>
            <div class="metric-copy"><span>RLS ENABLED</span><strong>131</strong><small>45.6% of total tables</small></div>
            <svg class="spark" viewBox="0 0 240 34"><polyline points="0,26 16,22 36,23 54,18 72,20 86,15 102,18 120,29 138,19 154,10 172,19 188,12 208,5 224,11 240,9"/></svg>
          </article>
          <article class="metric-card">
            <div class="metric-icon shield warning">!</div>
            <div class="metric-copy"><span>RLS DISABLED (PUBLIC)</span><strong>156</strong><small>Security risk detected</small></div>
            <svg class="spark" viewBox="0 0 240 34"><polyline points="0,27 18,22 36,24 54,18 73,22 90,14 108,22 126,17 142,8 160,15 178,24 195,18 210,7 226,13 240,10"/></svg>
          </article>
        </div>

        <div class="primary-grid searchable-zone">
          <article class="panel alerts-panel">
            <div class="panel-head"><h2><span class="alert-triangle">▲</span> CRITICAL ALERTS</h2><button>VIEW ALL</button></div>
            <div class="alert-list">
              <div class="alert-row"><i></i><div><strong>156 Public Tables Without RLS</strong><span>High risk of data exposure</span></div><b>BLOCKER</b></div>
              <div class="alert-row"><i></i><div><strong>ncp_audit_events RLS Failures</strong><span>Failing every 5 minutes</span></div><b>BLOCKER</b></div>
              <div class="alert-row"><i></i><div><strong>Unrestricted Authenticated Access</strong><span>Artifact &amp; approval tables wide open</span></div><b>BLOCKER</b></div>
              <div class="alert-row"><i></i><div><strong>Missing Rollback Statements</strong><span>New migration lacks rollback</span></div><b>BLOCKER</b></div>
              <div class="alert-row"><i></i><div><strong>Reflection Loop Growth</strong><span>242 reflections, no governed output</span></div><b>BLOCKER</b></div>
            </div>
          </article>

          <article class="panel chart-panel">
            <div class="panel-head"><h2>REFLECTION LOGS TREND</h2><div class="chart-badge"><span>Total: 242</span><b>↑ 23</b></div></div>
            <div class="chart-wrap">
              <svg viewBox="0 0 470 250" preserveAspectRatio="none" aria-label="Reflection logs chart">
                <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7a817" stop-opacity=".46"/><stop offset="1" stop-color="#e7a817" stop-opacity=".02"/></linearGradient></defs>
                <g class="grid-lines"><line x1="45" y1="35" x2="450" y2="35"/><line x1="45" y1="88" x2="450" y2="88"/><line x1="45" y1="141" x2="450" y2="141"/><line x1="45" y1="194" x2="450" y2="194"/><line x1="45" y1="238" x2="450" y2="238"/></g>
                <path class="area" d="M45 210 L105 174 L167 143 L228 112 L290 83 L350 56 L411 27 L411 238 L45 238 Z"/>
                <path class="trend" d="M45 210 L105 174 L167 143 L228 112 L290 83 L350 56 L411 27"/>
                <g class="points"><circle cx="45" cy="210" r="5"/><circle cx="105" cy="174" r="5"/><circle cx="167" cy="143" r="5"/><circle cx="228" cy="112" r="5"/><circle cx="290" cy="83" r="5"/><circle cx="350" cy="56" r="5"/><circle cx="411" cy="27" r="5"/></g>
                <g class="axis-labels"><text x="6" y="241">0</text><text x="0" y="198">50</text><text x="0" y="145">100</text><text x="0" y="92">150</text><text x="0" y="39">250</text><text x="31" y="258">Jul 17</text><text x="91" y="258">Jul 18</text><text x="153" y="258">Jul 19</text><text x="215" y="258">Jul 20</text><text x="276" y="258">Jul 21</text><text x="337" y="258">Jul 22</text><text x="397" y="258">Jul 23</text></g>
              </svg>
            </div>
          </article>

          <article class="panel pipelines-panel">
            <div class="panel-head"><h2>PIPELINES OVERVIEW</h2><button>VIEW ALL</button></div>
            <div class="pipeline-list">
              <div class="pipeline-row"><strong>Golden Path Pipeline</strong><b class="status good">ACTIVE</b><span>5 Jobs<br><small>34 Receipts | 2 Assets</small></span><i>›</i></div>
              <div class="pipeline-row"><strong>XAI Titanium Queue</strong><b class="status good">ACTIVE</b><span>0 Jobs<br><small>16 Receipts</small></span><i>›</i></div>
              <div class="pipeline-row"><strong>XAI Factory</strong><b class="status idle">IDLE</b><span>0 Jobs</span><i>›</i></div>
              <div class="pipeline-row"><strong>Legacy XAB Queue</strong><b class="status bad">FAILURES</b><span>Auth 401 Errors</span><i>›</i></div>
              <div class="pipeline-row"><strong>Scraper Pipeline</strong><b class="status bad">FAILURES</b><span>268 Runs | 0 Leads</span><i>›</i></div>
            </div>
          </article>
        </div>

        <div class="secondary-grid searchable-zone">
          <article class="panel security-panel">
            <div class="panel-head"><h2>SECURITY POSTURE</h2></div>
            <div class="security-body">
              <div class="donut"><div><strong>156</strong><span>Public Tables<br>Without RLS</span></div></div>
              <div class="legend">
                <div><i class="risk critical"></i><span>Critical Risk</span><strong>156</strong></div>
                <div><i class="risk medium"></i><span>Medium Risk</span><strong>71</strong></div>
                <div><i class="risk low"></i><span>Low Risk</span><strong>60</strong></div>
              </div>
            </div>
            <button class="panel-link">VIEW SECURITY REPORT <span>→</span></button>
          </article>

          <article class="panel bridge-panel">
            <div class="panel-head"><h2>ARTIFACT &amp; BRIDGE STATUS</h2></div>
            <div class="bridge-list">
              <div><span class="bridge-icon">⌛</span><strong>Artifact Tables</strong><b class="purple">13 <small>New</small></b><em class="tag risk-tag">RISK</em></div>
              <div><span class="bridge-icon">↗</span><strong>Bridge Tables</strong><b class="purple">8 <small>New</small></b><em class="tag risk-tag">RISK</em></div>
              <div><span class="bridge-icon">▧</span><strong>Migrations</strong><b class="purple">2</b><em class="tag warn-tag">WARN</em></div>
              <div><span class="bridge-icon">↻</span><strong>Rollback Coverage</strong><b class="purple">0%</b><em class="tag risk-tag">RISK</em></div>
              <div><span class="bridge-icon">⚿</span><strong>Migration Idempotency Keys</strong><b class="purple">0%</b><em class="tag risk-tag">RISK</em></div>
            </div>
            <button class="panel-link">VIEW ARTIFACT &amp; BRIDGE <span>→</span></button>
          </article>

          <article class="panel activity-panel">
            <div class="panel-head"><h2>RECENT ACTIVITY</h2><button>VIEW ALL</button></div>
            <div class="activity-list">
              <div><i class="ok"></i><time>10:24 AM</time><span>xai_cost_log read</span><b class="ok-text">200</b></div>
              <div><i class="ok"></i><time>10:24 AM</time><span>xai_job_queue health check</span><b class="ok-text">200</b></div>
              <div><i class="ok"></i><time>10:24 AM</time><span>Expired job cleanup (PATCH)</span><b class="ok-text">200</b></div>
              <div><i class="violet"></i><time>10:23 AM</time><span>xai_receipt_log insert</span><b class="ok-text">201</b></div>
              <div><i class="error"></i><time>10:23 AM</time><span>ncp_audit_events insert</span><b class="bad-text">RLS FAIL</b></div>
            </div>
            <button class="panel-link">VIEW ACTIVITY LOGS <span>→</span></button>
          </article>
        </div>

        <div class="counter-grid searchable-zone">
          <article class="counter-card"><div class="counter-icon">✓</div><span>APPROVALS</span><strong>0</strong><small>No recent activity</small></article>
          <article class="counter-card"><div class="counter-icon">♢</div><span>VALIDATIONS</span><strong>0</strong><small>No recent activity</small></article>
          <article class="counter-card"><div class="counter-icon">⌁</div><span>REPAIRS</span><strong>0</strong><small>No recent activity</small></article>
          <article class="counter-card"><div class="counter-icon">!</div><span>INCIDENTS</span><strong>0</strong><small>No recent activity</small></article>
          <article class="counter-card"><div class="counter-icon">◷</div><span>CRON RUNS</span><strong>0</strong><small>No recent activity</small></article>
          <article class="counter-card"><div class="counter-icon">▱</div><span>DEAD LETTERS</span><strong>0</strong><small>No recent activity</small></article>
        </div>

        <footer class="release-bar">
          <span class="release-shield">◆</span>
          <p>PRODUCTION RELEASE AND EXPANDED AUTONOMY REMAIN <b>LOCKED</b> UNTIL ALL BLOCKERS ARE RESOLVED.</p>
          <button disabled><span>▣</span> PRODUCTION LOCKED</button>
        </footer>
      </section>
    </main>
  </div>`;

export default function SupabaseCommandCenterPage() {
  useEffect(() => {
    const root = document.getElementById('xab-command-center-root');
    if (!root) return;

    const navItems = Array.from(root.querySelectorAll<HTMLButtonElement>('.nav-item'));
    const title = root.querySelector<HTMLElement>('.title-wrap h1 small');
    const navCleanups = navItems.map((item) => {
      const handler = () => {
        navItems.forEach((nav) => nav.classList.remove('active'));
        item.classList.add('active');
        if (title && item.dataset.section) title.textContent = item.dataset.section.toUpperCase();
      };
      item.addEventListener('click', handler);
      return () => item.removeEventListener('click', handler);
    });

    const search = root.querySelector<HTMLInputElement>('#globalSearch');
    const searchHandler = (event: Event) => {
      const term = (event.currentTarget as HTMLInputElement).value.trim().toLowerCase();
      root.querySelectorAll<HTMLElement>('.searchable-zone article').forEach((card) => {
        card.classList.toggle('search-hidden', Boolean(term) && !card.textContent?.toLowerCase().includes(term));
      });
    };
    search?.addEventListener('input', searchHandler);

    const ranges = ['LAST 24 HOURS', 'LAST 7 DAYS', 'LAST 30 DAYS'];
    let rangeIndex = 0;
    const rangeButton = root.querySelector<HTMLButtonElement>('#rangeButton');
    const rangeHandler = () => {
      rangeIndex = (rangeIndex + 1) % ranges.length;
      if (rangeButton) rangeButton.innerHTML = `${ranges[rangeIndex]} <span>⌄</span>`;
    };
    rangeButton?.addEventListener('click', rangeHandler);

    return () => {
      navCleanups.forEach((cleanup) => cleanup());
      search?.removeEventListener('input', searchHandler);
      rangeButton?.removeEventListener('click', rangeHandler);
    };
  }, []);

  return (
    <div
      id="xab-command-center-root"
      className="xab-command-center"
      aria-label="XAB Supabase Command Center"
      dangerouslySetInnerHTML={{ __html: dashboardMarkup }}
    />
  );
}
