import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Account: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setStatus({ type: 'success', message: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-lime-500/10 text-lime-400 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
              <p className="text-slate-400">Manage your security preferences and profile details.</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 mb-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6 border-b border-slate-700 pb-4">Profile Information</h2>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Email Address</span>
              <span className="text-lg text-white font-medium bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                {user?.email || 'No email found'}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
              <Key className="w-5 h-5 text-lime-400" />
              <h2 className="text-xl font-semibold text-white">Change Password</h2>
            </div>

            {status && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-lime-500/10 text-lime-400 border border-lime-500/20'}`}>
                {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span className="font-medium">{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-400">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-400">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword}
                className="mt-2 py-3 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
