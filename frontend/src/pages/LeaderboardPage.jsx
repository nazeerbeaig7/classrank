import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StudentTable from '../components/StudentTable';
import { leaderboardService, excelService } from '../services/api';
import { 
  Trophy, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileDown, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';

const LeaderboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [backlogFilter, setBacklogFilter] = useState('all');
  const [sortControl, setSortControl] = useState('default'); // default, pct_desc, pct_asc, cgpa_desc, cgpa_asc, bl_asc

  useEffect(() => {
    fetchLeaderboard();
  }, [search, backlogFilter, sortControl]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let params = { search, backlogFilter };
      
      if (sortControl === 'pct_desc') {
        params.sortBy = 'percentage';
        params.sortOrder = 'desc';
      } else if (sortControl === 'pct_asc') {
        params.sortBy = 'percentage';
        params.sortOrder = 'asc';
      } else if (sortControl === 'cgpa_desc') {
        params.sortBy = 'cgpa';
        params.sortOrder = 'desc';
      } else if (sortControl === 'cgpa_asc') {
        params.sortBy = 'cgpa';
        params.sortOrder = 'asc';
      } else if (sortControl === 'bl_asc') {
        params.sortBy = 'backlogCount';
        params.sortOrder = 'asc';
      }

      const res = await leaderboardService.getLeaderboard(params);
      setData(res.data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const groups = data?.groups || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Leaderboard Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-300" />
              ClassRank Academic Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Academic Performance Leaderboard
            </h1>
            <p className="text-sm text-slate-300">
              Automated ranking prioritized by: Backlog Count ASC &rarr; Percentage DESC &rarr; CGPA DESC &rarr; Roll Number ASC
            </p>
          </div>

          <button
            onClick={() => excelService.exportExcel()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 hover:from-amber-400 hover:to-amber-500 transition-all shrink-0 z-10"
          >
            <FileDown className="w-4 h-4" />
            Export Excel Leaderboard
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 0}
            subtitle="Registered in system"
            icon={Users}
            color="indigo"
          />

          <StatCard
            title="Zero Backlogs"
            value={stats.zeroBacklogs || 0}
            subtitle="0 Backlog Group"
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            title="One Backlog"
            value={stats.oneBacklog || 0}
            subtitle="1 Backlog Group"
            icon={AlertTriangle}
            color="amber"
          />

          <StatCard
            title="Two Backlogs"
            value={stats.twoBacklogs || 0}
            subtitle="2 Backlog Group"
            icon={AlertTriangle}
            color="orange"
          />

          <StatCard
            title="Highest Score"
            value={`${stats.highestPercentage || 0}%`}
            subtitle={`Highest CGPA: ${stats.highestCgpa || 0}`}
            icon={Award}
            color="purple"
          />
        </div>

        {/* Controls: Search, Backlog Filter Tabs & Sort Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search by roll number or student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Sort Controls Dropdown */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortControl}
                onChange={(e) => setSortControl(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="default">Default Sort (Backlogs ASC → % DESC → CGPA DESC)</option>
                <option value="pct_desc">Percentage: High → Low</option>
                <option value="pct_asc">Percentage: Low → High</option>
                <option value="cgpa_desc">CGPA: High → Low</option>
                <option value="cgpa_asc">CGPA: Low → High</option>
                <option value="bl_asc">Backlogs: Low → High</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Students' },
              ...Array.from(new Set(data?.students?.map(s => s.backlogCount) || [0, 1, 2, 3, 4]))
                .sort((a, b) => a - b)
                .map(count => ({
                  id: String(count),
                  label: count === 0 ? '0 Backlogs' : `${count} Backlog${count > 1 ? 's' : ''}`
                }))
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBacklogFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  backlogFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Calculating Rankings...</p>
          </div>
        )}

        {/* Leaderboard Tables (Default Grouped or Filtered View) */}
        {!loading && (
          <div className="space-y-8">
            {/* If a backlog filter or custom sort is applied, show single table */}
            {backlogFilter !== 'all' || sortControl !== 'default' || search ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Filtered Leaderboard View ({data?.count || 0} Students)
                  </h2>
                </div>
                <StudentTable students={data?.students || []} />
              </div>
            ) : (
              /* Dynamic Grouped Sections for any backlog count (0, 1, 2, 3, 4, 5, 6...) */
              data?.backlogGroups && data.backlogGroups.length > 0 ? (
                data.backlogGroups.map((group) => {
                  const count = group.backlogCount;
                  const isZero = count === 0;
                  const isOne = count === 1;
                  const isTwo = count === 2;

                  const bgClass = isZero
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : isOne
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : isTwo
                    ? 'bg-orange-50/80 border-orange-200 text-orange-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950';

                  const iconBg = isZero ? 'bg-emerald-600' : isOne ? 'bg-amber-500' : isTwo ? 'bg-orange-500' : 'bg-rose-600';
                  const icon = isZero ? '🏆' : '📚';

                  return (
                    <div key={count} className="space-y-3">
                      <div className={`flex items-center justify-between p-4 rounded-2xl border ${bgClass}`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${iconBg} text-white flex items-center justify-center font-bold text-sm`}>
                            {icon}
                          </div>
                          <div>
                            <h2 className="text-lg font-extrabold uppercase tracking-tight">{group.title}</h2>
                            <p className="text-xs opacity-90 font-medium">
                              {isZero
                                ? `Highest Academic Priority Group (${group.students.length} Students)`
                                : `${count} Backlog Group (${group.students.length} Students)`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <StudentTable students={group.students} showGroupRank={true} />
                    </div>
                  );
                })
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;
