import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { History, Trash2, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface ScanItem {
  _id: string;
  scanType: 'text' | 'image';
  contentReference?: string;
  thumbnailUrl?: string;
  originalText?: string;
  resultData: any;
  createdAt: string;
}

const ScanHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/scan/history');
        console.log('Fetched History:', response.data);
        setHistory(response.data);
      } catch (err: any) {
        console.error('Failed to fetch history', err);
        setError('Failed to load scan history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/scan/history/${id}`);
      setHistory(prev => prev.filter(scan => scan._id !== id));
    } catch (err: any) {
      console.error('Failed to delete history record', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-10 py-8 md:py-16">
        <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-lime-500/10 text-lime-400 rounded-xl">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Scan History</h1>
              <p className="text-slate-400">Review your past content verification scans.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <span className="text-slate-400 font-medium animate-pulse">Loading history...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 border border-slate-700/50 rounded-3xl">
              <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-slate-300">No history yet</h3>
              <p className="text-slate-500 mt-2">Your past scans will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((scan) => {
                const activeBadges: { label: string; className: string }[] = [];
                
                if (scan.scanType === 'image' && scan.resultData) {
                  if (scan.resultData.isAiGenerated) {
                    activeBadges.push({ label: 'AI Generated', className: 'text-red-400 bg-red-400/10' });
                  }
                  if (scan.resultData.isEdited) {
                    activeBadges.push({ label: 'Edited', className: 'text-amber-400 bg-amber-400/10' });
                  }
                  if (scan.resultData.hasC2pa) {
                    activeBadges.push({ label: 'Authentic', className: 'text-lime-400 bg-lime-400/10' });
                  }
                  if (!scan.resultData.hasC2pa && scan.resultData.producer && scan.resultData.producer !== 'Unknown') {
                    activeBadges.push({ label: 'Standard EXIF', className: 'text-blue-400 bg-blue-400/10' });
                  }
                  if (scan.resultData.exifDetails?.lat) {
                    activeBadges.push({ label: 'GPS Data', className: 'text-teal-400 bg-teal-400/10' });
                  }
                  if (!scan.resultData.hasC2pa && (!scan.resultData.producer || scan.resultData.producer === 'Unknown') && !scan.resultData.isAiGenerated && !scan.resultData.exifDetails?.lat) {
                    activeBadges.push({ label: 'Unverified Origin', className: 'bg-slate-700 text-slate-300' });
                  }
                } else if (scan.scanType === 'text' && scan.resultData) {
                  if (scan.resultData.isWatermarked) {
                    activeBadges.push({ label: 'AI Detected', className: 'text-red-400 bg-red-400/10' });
                  } else {
                    activeBadges.push({ label: 'Authentic', className: 'text-lime-400 bg-lime-400/10' });
                  }
                }

                return (
                  <div 
                    key={scan._id} 
                    onClick={() => navigate('/', { state: { historicalResult: { ...scan.resultData, thumbnailUrl: scan.thumbnailUrl }, historicalType: scan.scanType, historicalText: scan.originalText } })}
                    className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {scan.thumbnailUrl ? (
                        <img src={scan.thumbnailUrl} alt="Scan thumbnail" className="w-12 h-12 rounded object-cover flex-shrink-0 border border-slate-700" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded flex-shrink-0 flex items-center justify-center text-slate-500 text-xs font-medium">
                          {scan.scanType === 'text' ? 'TXT' : 'IMG'}
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            scan.scanType === 'text' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {scan.scanType}
                          </span>
                          <span className="text-sm text-slate-400 border-r border-slate-700 pr-3">
                            {new Date(scan.createdAt).toLocaleString()}
                          </span>
                          {activeBadges.map((badge, index) => (
                            <span key={index} className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          ))}
                        </div>
                        <p className="text-white font-medium truncate max-w-lg">
                          {scan.contentReference || 'No reference available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(scan._id); }} 
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </Layout>
  );
};

export default ScanHistory;
