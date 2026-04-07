import { useState, useEffect } from 'react';
import { RequestLog } from '../types';
import '../styles/LogViewer.css';

interface LogViewerProps {
  maxLogs?: number;
}

function LogViewer({ maxLogs = 100 }: LogViewerProps) {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'allowed' | 'blocked' | 'warning'>('all');

  // Simulate log updates (in real app, use WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // This would be replaced with actual log fetching from backend
      // For now, just demonstration structure
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs
    .filter((log) => {
      if (filter === 'all') return true;
      return log.action === filter;
    })
    .slice(0, maxLogs);

  const allowedCount = logs.filter((l) => l.action === 'allowed').length;
  const blockedCount = logs.filter((l) => l.action === 'blocked').length;
  const warningCount = logs.filter((l) => l.action === 'warning').length;

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h2>Request Logs</h2>
        <div className="log-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({logs.length})
          </button>
          <button
            className={`filter-btn ${filter === 'allowed' ? 'active' : ''}`}
            onClick={() => setFilter('allowed')}
          >
            Allowed ({allowedCount})
          </button>
          <button
            className={`filter-btn ${filter === 'blocked' ? 'active' : ''}`}
            onClick={() => setFilter('blocked')}
          >
            Blocked ({blockedCount})
          </button>
          <button
            className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Warning ({warningCount})
          </button>
        </div>
      </div>

      <div className="log-list">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">No logs to display</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`log-entry log-${log.action}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-ip">{log.ip}</span>
              <span className="log-method">{log.method}</span>
              <span className="log-endpoint">{log.endpoint}</span>
              <span className={`log-status status-${log.status}`}>{log.status}</span>
              <span className={`log-action action-${log.action}`}>
                {log.action === 'allowed' ? 'OK' : log.action === 'blocked' ? 'BLOCK' : 'WARN'}
              </span>
              {log.reason && <span className="log-reason">{log.reason}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogViewer;
