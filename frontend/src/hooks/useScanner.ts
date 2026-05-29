import { useState } from 'react';
import api from '../services/api';

export type ScanType = 'text' | 'image' | 'video';

export interface UseScannerState {
  result: any | null;
  loading: boolean;
  error: string | null;
  setResult: (result: any) => void;
}

export const useScanner = () => {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onScan = async (type: ScanType, payload: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (type === 'text') {
        const response = await api.post('/scan/text', { text: payload });
        setResult({ type: 'text', ...response.data.result });
      } else if (type === 'image') {
        const formData = new FormData();
        formData.append('image', payload);
        const response = await api.post('/scan/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setResult({ type: 'image', ...response.data.result });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, onScan, setResult };
};
