import { useState, useCallback, useEffect } from 'react';
import { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode: number | null;
}

interface UseApiOptions {
  autoFetch?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const { autoFetch = false, retryCount = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: null,
  });

  const [retries, setRetries] = useState(0);

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result.data || null,
        loading: false,
        error: null,
        statusCode: 200,
      });
      setRetries(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (retries < retryCount) {
        setRetries((prev) => prev + 1);
        setTimeout(() => {
          fetch();
        }, retryDelay);
      } else {
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          statusCode: 429,
        });
      }
    }
  }, [apiCall, retries, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, statusCode: null });
    setRetries(0);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    ...state,
    refetch: fetch,
    reset,
  };
}
