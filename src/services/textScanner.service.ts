export interface ScanResult {
  score?: number;
  isWatermarked?: boolean;
  error?: string;
}

export const scanTextForWatermark = async (text: string): Promise<ScanResult> => {
  const scannerUrl = process.env.SCANNER_URL || 'http://localhost:8000/scan';
  
  try {
    const response = await fetch(scannerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as { detail?: string } | null;
      throw new Error(errorData?.detail || `Scanner responded with status ${response.status}`);
    }

    const data = await response.json() as ScanResult;
    return {
      score: data.score,
      isWatermarked: data.isWatermarked,
    };
  } catch (error: any) {
    console.error('Failed to communicate with SynthID scanner:', error.message);
    throw new Error('Failed to run scan');
  }
};
