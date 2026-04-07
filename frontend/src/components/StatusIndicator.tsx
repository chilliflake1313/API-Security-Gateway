import '../styles/StatusIndicator.css';

interface StatusIndicatorProps {
  label: string;
  isHealthy: boolean;
  details?: string;
}

function StatusIndicator({ label, isHealthy, details }: StatusIndicatorProps) {
  return (
    <div className={`status-indicator ${isHealthy ? 'healthy' : 'unhealthy'}`}>
      <div className="status-dot">
        <span className={`dot ${isHealthy ? 'green' : 'red'}`} />
      </div>
      <div className="status-content">
        <label>{label}</label>
        <span className="status-text">
          {isHealthy ? '🟢 Healthy' : '🔴 Unhealthy'}
        </span>
        {details && <p className="status-details">{details}</p>}
      </div>
    </div>
  );
}

export default StatusIndicator;
