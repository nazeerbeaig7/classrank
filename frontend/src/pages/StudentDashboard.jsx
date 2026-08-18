import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RankBadge from '../components/RankBadge';
import BacklogBadge from '../components/BacklogBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { studentService, settingsService } from '../services/api';
import { Trophy, User, Award, Edit3, Lock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const StudentDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [canEditGlobal, setCanEditGlobal] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    backlogCount: user?.backlogCount || 0,
    cgpa: user?.cgpa || 0,
    percentage: user?.percentage || 0
  });

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        backlogCount: user.backlogCount,
        cgpa: user.cgpa,
        percentage: user.percentage
      });
    }
  }, [user]);

  const fetchGlobalSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      setCanEditGlobal(res.data.settings?.allowStudentEdits ?? true);
    } catch (err) {
      console.error('Settings fetch error:', err);
    }
  };

  const handleUpdateSelf = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentService.update(user._id, {
        name: formData.name,
        backlogCount: Number(formData.backlogCount),
        cgpa: Number(formData.cgpa),
        percentage: Number(formData.percentage)
      });
      await refreshProfile();
      showSuccess('Academic record updated successfully!');
      setEditModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to update academic record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Rank Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Student Account
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-slate-300 font-mono">
                Roll Number: <span className="font-bold text-white">{user?.rollNumber}</span> | Email: {user?.email}
              </p>
            </div>

            {/* Rank Highlights Box */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center px-3 border-r border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Group Rank</div>
                <div className="text-2xl font-extrabold text-amber-300 mt-0.5">
                  #{user?.groupRank || 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400">in {user?.backlogCount} Backlog Group</div>
              </div>

              <div className="text-center px-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Overall Rank</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  #{user?.overallRank || 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400">out of {user?.totalStudents || 0} Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backlogs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Backlog Count</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {user?.backlogCount} <span className="text-xs font-normal text-slate-500">Subjects</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Priority Sorting Level #{user?.backlogCount + 1}</p>
            </div>
            <BacklogBadge count={user?.backlogCount} />
          </div>

          {/* CGPA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">CGPA</p>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1 font-mono">
                {user?.cgpa?.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 10.00</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Cumulative Grade Point Average</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              GPA
            </div>
          </div>

          {/* Percentage */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Percentage</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">
                {user?.percentage?.toFixed(2)}%
              </h3>
              <p className="text-xs text-slate-500 mt-1">Primary Academic Metric</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              %
            </div>
          </div>
        </div>

        {/* Data Ownership & Edit Authorization Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Academic Data Management</h3>
              <p className="text-xs text-slate-500">
                Students can only view and update their own submitted academic information.
              </p>
            </div>

            {canEditGlobal ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit My Academic Data
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg border border-slate-200">
                <Lock className="w-4 h-4 text-slate-400" />
                Editing Locked by Admin
              </div>
            )}
          </div>

          {!canEditGlobal && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                The institutional administrator has currently locked self-editing of academic scores. If you notice any discrepancies in your recorded backlog count or marks, please contact the administration office.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Data Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Academic Information"
      >
        <form onSubmit={handleUpdateSelf} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={formData.backlogCount}
                onChange={(e) => setFormData({ ...formData, backlogCount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Saving...' : 'Save & Recalculate Rank'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
