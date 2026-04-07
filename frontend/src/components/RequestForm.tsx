import { useState } from 'react';
import { apiService } from '../services/api.service';
import { RateLimitStatus } from '../types';
import '../styles/RequestForm.css';

interface RequestFormProps {
  status: RateLimitStatus | null;
  onRequestSent: () => void;
}

interface RequestResult {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
}

function RequestForm({ status, onRequestSent }: RequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [burstCount, setBurstCount] = useState(10);

  const sendSingleRequest = async () => {
    setLoading(true);
    try {
      const response = await apiService.test();
      const result: RequestResult = {
        success: response.success,
        message: response.data?.message || 'Success',
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
      };
      setResults((prev) => [result, ...prev].slice(0, 50));
      onRequestSent();
    } catch (error) {
      const result: RequestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
        status: 429,
        timestamp: new Date().toLocaleTimeString(),
      };
      setResults((prev) => [result, ...prev].slice(0, 50));
    } finally {
      setLoading(false);
    }
  };

  const sendBurstRequests = async () => {
    setLoading(true);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < burstCount; i++) {
      const promise = apiService
        .test()
        .then((response) => {
          const result: RequestResult = {
            success: true,
            message: `Request ${i + 1}: ${response.data?.message}`,
            status: 200,
            timestamp: new Date().toLocaleTimeString(),
          };
          setResults((prev) => [result, ...prev].slice(0, 50));
        })
        .catch((error) => {
          const result: RequestResult = {
            success: false,
            message: `Request ${i + 1}: ${error.message}`,
            status: 429,
            timestamp: new Date().toLocaleTimeString(),
          };
          setResults((prev) => [result, ...prev].slice(0, 50));
        });
      promises.push(promise);
    }

    await Promise.all(promises);
    setLoading(false);
    onRequestSent();
  };

  const clearResults = () => {
    setResults([]);
  };

  const isBlocked = status?.isBlocked ?? false;
  const canSendBurst = status && status.remaining >= burstCount;

  return (
    <div className="request-form">
      <h2>Test Rate Limiting</h2>

      <div className="form-controls">
        <button
          onClick={sendSingleRequest}
          disabled={loading || isBlocked}
          className="btn btn-primary"
        >
          {loading ? 'Sending...' : 'Send Single Request'}
        </button>

        <div className="burst-control">
          <label>Burst Count:</label>
          <input
            type="number"
            min="1"
            max="200"
            value={burstCount}
            onChange={(e) => setBurstCount(parseInt(e.target.value) || 10)}
            disabled={loading}
          />
          <button
            onClick={sendBurstRequests}
            disabled={loading || isBlocked || !canSendBurst}
            className="btn btn-warning"
          >
            {loading ? 'Sending...' : `Send ${burstCount} Requests`}
          </button>
        </div>

        {results.length > 0 && (
          <button onClick={clearResults} className="btn btn-secondary">
            Clear Results
          </button>
        )}
      </div>

      {isBlocked && (
        <div className="alert alert-danger">
          You are currently rate limited. Reset at:{' '}
          {new Date(status.resetAt * 1000).toLocaleTimeString()}
        </div>
      )}

      {!canSendBurst && !isBlocked && burstCount > (status?.remaining ?? 0) && (
        <div className="alert alert-warning">
          Not enough remaining requests for burst. Only {status?.remaining} left.
        </div>
      )}

      <div className="results-section">
        <h3>Request Results ({results.length})</h3>
        <div className="results-list">
          {results.map((result, index) => (
            <div
              key={`${result.timestamp}-${index}`}
              className={`result-item ${result.success ? 'success' : 'error'}`}
            >
              <span className="result-timestamp">{result.timestamp}</span>
              <span className="result-status">
                {result.success ? 'OK' : 'ERR'} [{result.status}]
              </span>
              <span className="result-message">{result.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RequestForm;
