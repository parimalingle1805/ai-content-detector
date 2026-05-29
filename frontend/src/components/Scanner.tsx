import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { type ScanType } from '../hooks/useScanner';

export interface ScanResultPayload {
  type: 'image' | 'text';
  thumbnailUrl?: string;
  score?: number;
  isWatermarked?: boolean;
  producer?: string;
  hasC2pa?: boolean;
  isAiGenerated?: boolean;
  isEdited?: boolean;
  edits?: any[];
  exifDetails?: {
    iso?: string;
    focalLength?: string;
    resolution?: string;
    lat?: number;
    lon?: number;
  };
}

interface ScannerProps {
  onScanComplete: (type: ScanType, payload: any) => void;
  isLoading?: boolean;
  activeTab?: ScanType;
  onTabChange?: (tab: ScanType) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, isLoading, activeTab, onTabChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [internalScanType, setInternalScanType] = useState<ScanType>('image');
  const scanType = activeTab || internalScanType;
  const setScanType = onTabChange || setInternalScanType;
  const [textContent, setTextContent] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.historicalType === 'text' && location.state?.historicalText) {
      setTextContent(location.state.historicalText);
    }
  }, [location.state]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      setError('Invalid file type. Please upload a valid image file.');
      return;
    }

    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    onScanComplete('image', file);

  }, [onScanComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const handleTextScan = () => {
    setError(null);
    if (!textContent.trim()) {
      setError('Please enter some text to scan.');
      return;
    }
    onScanComplete('text', textContent);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex gap-4 bg-slate-800 p-2 rounded-xl border border-slate-700">
        <button 
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${scanType === 'image' ? 'bg-lime-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setScanType('image')}
        >
          Image Scan
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${scanType === 'text' ? 'bg-lime-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setScanType('text')}
        >
          Text Scan
        </button>
        <button 
          disabled
          className="flex-1 py-2 rounded-lg font-medium text-slate-600 cursor-not-allowed"
          title="Video scanning is coming soon!"
        >
          Video (Coming Soon)
        </button>
      </div>

      {scanType === 'image' ? (
        <div
          {...getRootProps()}
          className={`relative flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-lime-400 bg-lime-400/5 shadow-[0_0_40px_rgba(163,230,53,0.2)]'
              : 'border-slate-700 bg-slate-800/50 hover:border-lime-500/50 hover:bg-slate-800'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
             <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
               <p className="text-slate-300 font-medium text-lg">Uploading and scanning image...</p>
             </div>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-6 transition-colors duration-300 ${isDragActive ? 'bg-lime-400/20' : 'bg-slate-700/50'}`}>
                <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-lime-400' : 'text-slate-400'}`} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Drop your image to analyze
              </h3>
              <p className="text-slate-400 text-center max-w-sm">
                Drag and drop an image here, or click to browse your computer.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            disabled={isLoading}
            className="w-full h-64 p-6 bg-slate-800/50 border-2 border-slate-700 rounded-3xl text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50 transition-colors resize-none"
            placeholder="Paste the text you want to analyze for AI signatures here..."
          />
          <button
            onClick={handleTextScan}
            disabled={isLoading}
            className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Scan Text'}
          </button>
          <p className="text-center text-sm text-slate-500 italic mt-2">
            Note: Currently configured exclusively for DeepMind SynthID watermarks (e.g., Gemini generations).
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Scanner;
