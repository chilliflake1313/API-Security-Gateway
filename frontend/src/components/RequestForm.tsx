import { useState } from 'react';
import { RateLimitStatus } from '../types';
import { apiService } from '../services/api.service';
import '../styles/RequestForm.css';

interface RequestFormProps {
  status: RateLimitStatus | null;
  onRequestSent: () => void;
}

function RequestForm({ status, onRequestSent }: RequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseMessage(null);

    try {
      const response = await apiService.test();

      if (response.success) {
        setIsSuccess(true);
        setResponseMessage(`✅ Success! Your IP: ${response.data?.ip}`);
      } else {
        setIsSuccess(false);
        setResponseMessage(`❌ Error: ${response.error}`);
      }

      // Refresh status after request
      onRequestSent();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Request failed';
      setIsSuccess(false);
      setResponseMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = status?.isBlocked ?? false;
  const canMakeRequest = !isBlocked && (status?.remaining ?? 0) > 0;

  return (
    <div className="request-form">
      <h2>Test API Rate Limiter</h2>

      <p className="description">
        Send requests to test the rate limiting system. You have{' '}
        <strong>{status?.remaining ?? '?'}</strong> requests remaining.
      </p>

      <button
        onClick={handleSendRequest}
        disabled={loading || !canMakeRequest}
        className={`send-button ${loading ? 'loading' : ''}`}
      >
        {loading ? '⏳ Sending...' : '📤 Send Request'}
      </button>

      {!canMakeRequest && (
        <div className="limitation-notice">
          <p>
            {isBlocked
              ? '🚫 Your IP is blocked. Wait before making more requests.'
              : '⚠️ Rate limit reached. Wait for the window to reset.'}
          </p>
        </div>
      )}

      {responseMessage && (
        <div className={`response-message ${isSuccess ? 'success' : 'error'}`}>
          {responseMessage}
        </div>
      )}
    </div>
  );
}

export default RequestForm;
