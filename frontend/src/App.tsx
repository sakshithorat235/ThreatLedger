import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/threats';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

type Threat = {
  _id: string;
  type: string;
  indicator: string;
  severity: Severity;
  status: string;
  description: string;
  createdAt: string;
};

function App() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [type, setType] = useState('Malware');
  const [indicator, setIndicator] = useState('');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [description, setDescription] = useState('');

  async function fetchThreats() {
    try {
      setError('');

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Threats load hou shakle nahit.');
      }

      setThreats(result.data);
    } catch {
      setError(
        'Backend connect hot nahi. Krupaya backend server check kara.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchThreats();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!type.trim() || !indicator.trim()) {
      setError('Threat type ani indicator required aahet.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          indicator: indicator.trim(),
          severity,
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Threat save hou shakla nahi.'
        );
      }

      setThreats((current) => [result.data, ...current]);
      setIndicator('');
      setDescription('');
      setSeverity('Medium');
      setShowForm(false);
      setMessage('Threat successfully database madhye save zala!');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Threat save kartana error ala.'
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredThreats = useMemo(() => {
    const query = search.toLowerCase().trim();

    return threats.filter((threat) => {
      const matchesSearch =
        threat.type.toLowerCase().includes(query) ||
        threat.indicator.toLowerCase().includes(query) ||
        threat.severity.toLowerCase().includes(query) ||
        threat.status.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === 'All' ||
        threat.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [threats, search, severityFilter]);

  const criticalCount = threats.filter(
    (threat) => threat.severity === 'Critical'
  ).length;

  const highCount = threats.filter(
    (threat) => threat.severity === 'High'
  ).length;

  const pendingCount = threats.filter(
    (threat) => threat.status === 'Pending'
  ).length;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h1>ThreatLedger</h1>
            <p>DECENTRALIZED THREAT INTELLIGENCE</p>
          </div>
        </div>

        <div className="connection-status">
          <span className="status-dot" />
          MongoDB API
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">THREAT INTELLIGENCE NETWORK</p>
          <h2>Cyber Threat Dashboard</h2>
          <p className="subtitle">
            Monitor, manage and track cybersecurity threats.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setMessage('');
          }}
        >
          {showForm ? 'Cancel' : '+ Report New Threat'}
        </button>
      </section>

      {error && (
        <div className="notice error-notice" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="notice success-notice" role="status">
          {message}
        </div>
      )}

      {showForm && (
        <section className="form-card">
          <h3>Report a New Threat</h3>
          <p className="subtitle">
            Threat information MongoDB database madhye save hoil.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Threat Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="Malware">Malware</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="DDoS">DDoS</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="Suspicious IP">Suspicious IP</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Indicator (IP / URL / Hash)
                <input
                  value={indicator}
                  onChange={(event) =>
                    setIndicator(event.target.value)
                  }
                  placeholder="Example: 192.0.2.100"
                  required
                />
              </label>

              <label>
                Severity
                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as Severity)
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the threat..."
                  rows={3}
                />
              </label>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Submit Threat'}
            </button>
          </form>
        </section>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Threats</p>
          <h3>{threats.length}</h3>
          <span>Database records</span>
        </article>

        <article className="stat-card critical-stat">
          <p>Critical Threats</p>
          <h3>{criticalCount}</h3>
          <span>Critical severity</span>
        </article>

        <article className="stat-card high-stat">
          <p>High Threats</p>
          <h3>{highCount}</h3>
          <span>High severity</span>
        </article>

        <article className="stat-card pending-stat">
          <p>Pending Threats</p>
          <h3>{pendingCount}</h3>
          <span>Awaiting review</span>
        </article>
      </section>

      <section className="threat-section">
        <div className="section-heading">
          <div>
            <h2>Threat Intelligence Feed</h2>
            <p className="subtitle">
              Threat records retrieved from MongoDB.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => void fetchThreats()}
          >
            Refresh
          </button>
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="Search threats..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
            aria-label="Filter by severity"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">Loading threats...</div>
        ) : filteredThreats.length === 0 ? (
          <div className="empty-state">
            <h3>No threats found</h3>
            <p>
              {threats.length === 0
                ? 'Database madhye threat add karnyasathi Report New Threat click kara.'
                : 'Search kiwa severity filter change karun paha.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Threat Type</th>
                  <th>Indicator</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredThreats.map((threat) => (
                  <tr key={threat._id}>
                    <td>{threat.type}</td>
                    <td className="indicator-cell">
                      {threat.indicator}
                    </td>
                    <td>
                      <span
                        className={`severity-badge ${threat.severity.toLowerCase()}`}
                      >
                        {threat.severity}
                      </span>
                    </td>
                    <td>{threat.status}</td>
                    <td>
                      {threat.createdAt
                        ? new Date(
                            threat.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>
          ThreatLedger · Decentralized Cyber Threat Intelligence
        </p>
        <p>React · Express · MongoDB</p>
      </footer>
    </main>
  );
}

export default App;