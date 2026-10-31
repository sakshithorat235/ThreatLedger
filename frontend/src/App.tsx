import { useState } from 'react';
import './App.css';

type Threat = {
  id: number;
  type: string;
  indicator: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Verified' | 'Pending';
  date: string;
};

const initialThreats: Threat[] = [
  {
    id: 1,
    type: 'Malicious IP',
    indicator: '192.0.2.45',
    severity: 'Critical',
    status: 'Verified',
    date: '2026-10-30',
  },
  {
    id: 2,
    type: 'Phishing URL',
    indicator: 'https://example.com/login',
    severity: 'High',
    status: 'Pending',
    date: '2026-10-29',
  },
  {
    id: 3,
    type: 'File Hash',
    indicator: 'a4f9c2d81b7e...',
    severity: 'Medium',
    status: 'Verified',
    date: '2026-10-28',
  },
];

function App() {
  const [threats, setThreats] = useState<Threat[]>(initialThreats);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [indicator, setIndicator] = useState('');
  const [type, setType] = useState('Malicious IP');
  const [severity, setSeverity] = useState<Threat['severity']>('High');

  const verifiedCount = threats.filter(
    (threat) => threat.status === 'Verified'
  ).length;

  const filteredThreats = threats.filter((threat) =>
    `${threat.type} ${threat.indicator} ${threat.severity} ${threat.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!indicator.trim()) {
      return;
    }

    const newThreat: Threat = {
      id: Date.now(),
      type,
      indicator: indicator.trim(),
      severity,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
    };

    setThreats((currentThreats) => [newThreat, ...currentThreats]);
    setIndicator('');
    setShowForm(false);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⬡</div>
          <div>
            <h2>ThreatLedger</h2>
            <span>THREAT INTELLIGENCE</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav className="navigation">
          <a className="nav-link active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>
          <a className="nav-link" href="#threats">
            <span>⌕</span> Threat Intelligence
          </a>
          <a className="nav-link" href="#organizations">
            <span>♧</span> Organizations
          </a>
          <a className="nav-link" href="#ledger">
            <span>⛓</span> Blockchain Ledger
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="network-status">
            <span className="status-dot"></span>
            <div>
              <strong>Network Status</strong>
              <p>Local demo mode</p>
            </div>
          </div>

          <p className="sidebar-footer">ThreatLedger v1.0.0</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>Security Dashboard</h1>
          </div>

          <div className="user-profile">
            <div className="avatar">S</div>
            <div>
              <strong>Security Analyst</strong>
              <p>Threat Intelligence Team</p>
            </div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">DECENTRALIZED CYBER DEFENSE</p>
            <h2>Threat Intelligence Overview</h2>
            <p>
              Monitor, analyze and share cyber threat intelligence
              across your network.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Report New Threat
          </button>
        </section>

        {showForm && (
          <section className="form-card">
            <h3>Report a Cyber Threat</h3>

            <form onSubmit={handleSubmit}>
              <label>
                Threat Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option>Malicious IP</option>
                  <option>Phishing URL</option>
                  <option>File Hash</option>
                </select>
              </label>

              <label>
                Threat Indicator
                <input
                  value={indicator}
                  onChange={(event) => setIndicator(event.target.value)}
                  placeholder="Enter a sample IP, URL or file hash"
                  required
                />
              </label>

              <label>
                Severity
                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as Threat['severity'])
                  }
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                </select>
              </label>

              <button className="primary-button" type="submit">
                Submit Threat
              </button>
            </form>

            <p className="form-note">
              Demo only: reports are currently stored in browser memory.
            </p>
          </section>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-heading">
              <span>Total Threats</span>
              <span className="stat-icon purple">⌘</span>
            </div>
            <h3>{threats.length}</h3>
            <p className="stat-description">Threat records in this demo</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Verified Threats</span>
              <span className="stat-icon green">✓</span>
            </div>
            <h3>{verifiedCount}</h3>
            <p className="stat-description">Marked as verified</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Pending Review</span>
              <span className="stat-icon orange">◷</span>
            </div>
            <h3>{threats.length - verifiedCount}</h3>
            <p className="stat-description">Awaiting verification</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Organizations</span>
              <span className="stat-icon blue">♧</span>
            </div>
            <h3>01</h3>
            <p className="stat-description">Demo organization</p>
          </article>
        </section>

        <section className="threat-section" id="threats">
          <div className="section-heading">
            <div>
              <h2>Recent Threat Intelligence</h2>
              <p>Review the latest reported indicators.</p>
            </div>

            <input
              className="search-input"
              type="search"
              placeholder="Search threats..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>THREAT TYPE</th>
                  <th>INDICATOR</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>REPORTED DATE</th>
                </tr>
              </thead>

              <tbody>
                {filteredThreats.map((threat) => (
                  <tr key={threat.id}>
                    <td>{threat.type}</td>
                    <td className="indicator">{threat.indicator}</td>
                    <td>
                      <span
                        className={`badge severity-${threat.severity.toLowerCase()}`}
                      >
                        {threat.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge status-${threat.status.toLowerCase()}`}
                      >
                        {threat.status}
                      </span>
                    </td>
                    <td>{threat.date}</td>
                  </tr>
                ))}

                {filteredThreats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No matching threats found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="demo-warning">
            ⚠ Sample data for demonstration only. These indicators have not
            been independently verified as malicious.
          </p>
        </section>

        <section className="bottom-grid">
          <article className="info-card" id="ledger">
            <div className="info-icon">⛓</div>
            <div>
              <h3>Blockchain Ledger</h3>
              <p>
                Future integration: record threat hashes and verification
                events on a blockchain.
              </p>
              <span className="coming-soon">NOT CONNECTED</span>
            </div>
          </article>

          <article className="info-card" id="organizations">
            <div className="info-icon">♧</div>
            <div>
              <h3>Organization Network</h3>
              <p>
                A foundation for sharing threat intelligence between
                participating organizations.
              </p>
              <span className="coming-soon">DEMO MODE</span>
            </div>
          </article>
        </section>

        <footer className="page-footer">
          ThreatLedger © 2026 · Decentralized Cyber Threat Intelligence
        </footer>
      </main>
    </div>
  );
}

export default App;