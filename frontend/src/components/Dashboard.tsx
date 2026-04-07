import { RateLimitStatus } from '../types';
import '../styles/Dashboard.css';

interface DashboardProps {
  status: RateLimitStatus | null;
  loading: boolean;
  error: string | null;
}

function Dashboard({ status, loading, error }: DashboardProps) {
  if (loading) {
    return <div className="dashboard loading">Loading status...</div>;
  }

  if (error) {
    return (
      <div className="dashboard error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return <div className="dashboard empty">No data available</div>;
  }

  const usage = (status.current / status.limit) * 100;
  const barColor = status.isBlocked ? '#e74c3c' : usage > 80 ? '#f39c12' : '#27ae60';

  return (
    <div className="dashboard">
      <h2>Rate Limit Status</h2>

      <div className="info-grid">
        <div className="info-card">
          <label>Your IP</label>
          <span className="value">{status.ip}</span>
        </div>

        <div className="info-card">
          <label>Status</label>
          <span className={`value status-${status.isBlocked ? 'blocked' : 'allowed'}`}>
            {status.isBlocked ? 'Blocked' : 'Allowed'}
          </span>
        </div>

        <div className="info-card">
          <label>Requests Used</label>
          <span className="value">
            {status.current} / {status.limit}
          </span>
        </div>

        <div className="info-card">
          <label>Remaining</label>
          <span className="value">{status.remaining}</span>
        </div>
      </div>

      <div className="progress-section">
        <h3>Usage Progress</h3>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(usage, 100)}%`,
              backgroundColor: barColor,
            }}
          >
            {Math.round(usage)}%
          </div>
        </div>
      </div>

      <div className="reset-info">
        <strong>Reset Time:</strong> {new Date(status.resetAt * 1000).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default Dashboard;
