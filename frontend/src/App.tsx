import { useState, useEffect } from 'react';
import { RateLimitStatus, MonitorResponse } from './types';
import { apiService } from './services/api.service';
import { useApi } from './hooks/useApi';
import Dashboard from './components/Dashboard';
import RequestForm from './components/RequestForm';
import StatusIndicator from './components/StatusIndicator';
import './styles/App.css';

function App() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const statusApi = useApi(
    () => apiService.getStatus(),
    { autoFetch: true, retryCount: 2 }
  );

  const monitorApi = useApi(
    () => apiService.getMonitor(),
    { autoFetch: true, retryCount: 2 }
  );

  // Refresh status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      statusApi.refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, statusApi]);

  // Refresh monitor every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      monitorApi.refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [monitorApi]);

  const status = statusApi.data as RateLimitStatus | null;
  const monitor = monitorApi.data as MonitorResponse | null;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛡️ API Security Gateway</h1>
        <p>Rate Limiting & Abuse Detection System</p>
      </header>

      <main className="app-main">
        <section className="status-section">
          <StatusIndicator
            label="System Status"
            isHealthy={monitor?.redis ?? false}
            details={monitor?.uptime ? `Uptime: ${Math.floor(monitor.uptime)}s` : 'Loading...'}
          />
        </section>

        <section className="dashboard-section">
          <Dashboard
            status={status}
            loading={statusApi.loading}
            error={statusApi.error}
          />
        </section>

        <section className="form-section">
          <RequestForm
            status={status}
            onRequestSent={() => statusApi.refetch()}
          />
        </section>

        <footer className="app-footer">
          <p>Built with React + TypeScript | Backend: Node.js + Express</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
