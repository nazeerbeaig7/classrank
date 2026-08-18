import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@classrank.edu');
  const [password, setPassword] = useState('adminpassword123');
  const [submitting, setSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showError('Please enter admin email and password');
      return;
    }

    setSubmitting(true);
    try {
      const admin = await loginAdmin(email.trim(), password);
      showSuccess(`Authenticated as Administrator: ${admin.name}`);
      navigate('/admin');
    } catch (err) {
      showError(err.message || 'Admin authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Admin Control Portal</h2>
            <p className="text-xs text-slate-400">Secure faculty & administration authentication</p>
          </div>

          {/* Quick Demo Hint Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-xs space-y-1">
            <div className="font-bold text-amber-300">🔑 Default Admin Demo Credentials:</div>
            <div className="font-mono text-slate-300">Email: admin@classrank.edu</div>
            <div className="font-mono text-slate-300">Password: adminpassword123</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@classrank.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium text-white placeholder-slate-500"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium text-white placeholder-slate-500"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Access Admin Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
