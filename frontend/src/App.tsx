import { useState, useEffect } from 'react';
import {
  fetchRateLimitStatus,
  sendTestRequest,
  resetRateLimit,
  RateLimitStatus,
} from './api';
import './styles.css';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  // State - Pure Data (No UI coupling)
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business Logic - Fetch Status
  const loadStatus = async () => {
    try {
      const data = await fetchRateLimitStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
    }
  };

  // Business Logic - Send Test Request
  const handleTestRequest = async () => {
    setLoading(true);
    try {
      const result = await sendTestRequest();
      addLog(`Request successful: ${result.message}`, 'success');
      await loadStatus();
    } catch (err) {
      addLog(`${err instanceof Error ? err.message : 'Request failed'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Business Logic - Reset Rate Limit
  const handleReset = async () => {
    try {
      await resetRateLimit();
      addLog('Rate limit reset successfully', 'success');
      await loadStatus();
    } catch (err) {
      addLog(`Reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  // Utility - Add Log Entry
  const addLog = (message: string, type: 'success' | 'error') => {
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  };

  // Auto-refresh status every 3 seconds
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Computed Values (UI-Ready Data)
  const usagePercent = status ? (status.current / status.limit) * 100 : 0;
  const progressColor =
    usagePercent >= 90 ? 'danger' : usagePercent >= 70 ? 'warning' : 'success';
  const statusColor = status?.isBlocked
    ? 'danger'
    : status && status.remaining < 20
    ? 'warning'
    : 'success';

  // Render (Pure Presentation - Easy to Replace with Aceternity UI)
  return (
    <div className="container">
      <header className="header">
        <h1>API Security Gateway</h1>
        <p>Rate Limiting & Abuse Detection System</p>
      </header>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {status?.isBlocked && (
        <div className="alert alert-danger">
          <strong>Rate Limit Exceeded</strong>
          <br />
          Reset at: {new Date(status.resetAt * 1000).toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Rate Limit Status</h2>

          {status ? (
            <>
              <div className="stats">
                <div className="stat-row">
                  <span className="stat-label">Your IP</span>
                  <span className="stat-value">{status.ip}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Current Requests</span>
                  <span className="stat-value">{status.current}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Limit</span>
                  <span className="stat-value">{status.limit}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Remaining</span>
                  <span className={`stat-value ${statusColor}`}>
                    {status.remaining}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value ${statusColor}`}>
                    {status.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${progressColor}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Actions</h2>

          <div className="button-group">
            <button
              className="btn-primary"
              onClick={handleTestRequest}
              disabled={loading || status?.isBlocked}
            >
              {loading ? 'Sending...' : 'Send Test Request'}
            </button>

            <button className="btn-danger" onClick={handleReset}>
              Reset Rate Limit
            </button>
          </div>

          {status?.isBlocked && (
            <div className="alert alert-info" style={{ marginTop: '16px' }}>
              Rate limit exceeded. Use reset button or wait for auto-reset.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Request Logs ({logs.length})</h2>

        <div className="logs">
          {logs.length === 0 ? (
            <p style={{ color: '#888' }}>No logs yet. Send a test request to start.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <div className="log-time">{log.timestamp}</div>
                <div>{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
