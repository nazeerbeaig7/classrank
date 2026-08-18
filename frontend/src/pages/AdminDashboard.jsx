import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RankBadge from '../components/RankBadge';
import { useToast } from '../components/Toast';
import { dashboardService, settingsService, excelService } from '../services/api';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Award, 
  Percent, 
  TrendingUp, 
  FileUp, 
  FileDown, 
  UserPlus, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardService.getStats();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudentEdits = async () => {
    if (!data?.settings) return;
    const newValue = !data.settings.allowStudentEdits;
    setToggling(true);
    try {
      await settingsService.updateSettings({ allowStudentEdits: newValue });
      setData((prev) => ({
        ...prev,
        settings: { ...prev.settings, allowStudentEdits: newValue }
      }));
      showSuccess(newValue ? 'Student self-edits unlocked!' : 'Student self-edits locked!');
    } catch (err) {
      showError(err.message || 'Failed to update setting');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Overview Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time academic performance analytics & backlog stats</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/import"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <FileUp className="w-4 h-4 text-indigo-600" />
              Import Excel
            </Link>

            <button
              onClick={() => excelService.exportExcel()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export Leaderboard
            </button>
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Student Self-Edit Permission</div>
              <div className="text-xs text-slate-500">
                {data?.settings?.allowStudentEdits
                  ? 'Students can edit their submitted academic records.'
                  : 'Student edits are currently LOCKED by administration.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleStudentEdits}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              data?.settings?.allowStudentEdits
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
            }`}
          >
            {data?.settings?.allowStudentEdits ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-600" />
                Edits Allowed (Click to Lock)
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-rose-600" />
                Edits Locked (Click to Unlock)
              </>
            )}
          </button>
        </div>

        {/* Primary Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 0}
            subtitle="Registered in database"
            icon={Users}
            color="indigo"
          />

          <StatCard
            title="0 Backlogs"
            value={stats.zeroBacklogs || 0}
            subtitle={`${((stats.zeroBacklogs / (stats.totalStudents || 1)) * 100).toFixed(1)}% of class`}
            icon={CheckCircle2}
            color="emerald"
            badge="Top Priority Group"
          />

          <StatCard
            title="1 Backlog"
            value={stats.oneBacklog || 0}
            subtitle="Single backlog group"
            icon={AlertTriangle}
            color="amber"
          />

          <StatCard
            title="2 & 3+ Backlogs"
            value={(stats.twoBacklogs || 0) + (stats.threePlusBacklogs || 0)}
            subtitle={`${stats.twoBacklogs || 0} (2 BL) | ${stats.threePlusBacklogs || 0} (3+ BL)`}
            icon={AlertCircle}
            color="rose"
          />
        </div>

        {/* Secondary Academic Averages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Highest Percentage"
            value={`${stats.highestPercentage || 0}%`}
            subtitle="Class Highest Score"
            icon={Percent}
            color="purple"
          />

          <StatCard
            title="Highest CGPA"
            value={(stats.highestCgpa || 0).toFixed(2)}
            subtitle="Class Highest GPA"
            icon={Award}
            color="blue"
          />

          <StatCard
            title="Average Percentage"
            value={`${stats.averagePercentage || 0}%`}
            subtitle="Class Mean Percentage"
            icon={TrendingUp}
            color="indigo"
          />

          <StatCard
            title="Average CGPA"
            value={(stats.averageCgpa || 0).toFixed(2)}
            subtitle="Class Mean GPA"
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Top 3 Performers Box & Backlog Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Performers */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                🏆 Top Performers Spotlight
              </h3>
              <Link to="/leaderboard" className="text-xs font-bold text-indigo-600 hover:underline">
                View Full Leaderboard &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data?.topPerformers?.map((student) => (
                <div
                  key={student.rollNumber}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={student.overallRank} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                      <p className="text-xs font-mono text-slate-500">{student.rollNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-extrabold text-indigo-700 font-mono">
                        {student.percentage}%
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.cgpa} CGPA
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Quick Actions</h3>

            <div className="space-y-2.5">
              <Link
                to="/admin/students"
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-800 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">Manage Students</div>
                  <div className="text-[10px] text-slate-500">Add, edit, or delete student profiles</div>
                </div>
              </Link>

              <Link
                to="/admin/import"
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-800 transition-colors"
              >
                <FileUp className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">Upload Excel Roster</div>
                  <div className="text-[10px] text-slate-500">Batch import students with row validation</div>
                </div>
              </Link>

              <button
                onClick={() => excelService.exportExcel()}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-800 transition-colors text-left"
              >
                <FileDown className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-xs font-bold">Download Excel Report</div>
                  <div className="text-[10px] text-slate-500">Export formatted sorted workbook</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
