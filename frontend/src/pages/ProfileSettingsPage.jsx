import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { settingsService } from '../services/api';
import { Settings as SettingsIcon, ShieldCheck, User, CheckCircle2, Lock, Save } from 'lucide-react';

const ProfileSettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [settings, setSettings] = useState({
    allowStudentEdits: true,
    academicYear: '2025-2026',
    departmentName: 'Computer Science & Engineering'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.data.settings) {
        setSettings({
          allowStudentEdits: res.data.settings.allowStudentEdits,
          academicYear: res.data.settings.academicYear || '2025-2026',
          departmentName: res.data.settings.departmentName || 'Computer Science & Engineering'
        });
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showSuccess('System settings saved successfully!');
    } catch (err) {
      showError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xl">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <p className="text-xs text-slate-500 font-mono">Roll Number: {user?.rollNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Registered Email</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">{user?.email}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Role</span>
                <p className="text-sm font-semibold text-indigo-600 mt-1">Student Account</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-500">Configure global platform permissions & institution metadata</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b pb-2">
                Permission Controls
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">Allow Student Self-Editing</div>
                  <div className="text-xs text-slate-500">Enable or disable students' ability to update their academic data</div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.allowStudentEdits}
                  onChange={(e) => setSettings({ ...settings, allowStudentEdits: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b pb-2">
                Institutional Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={settings.departmentName}
                  onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
