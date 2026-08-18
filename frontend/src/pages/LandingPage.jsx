import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trophy, Award, ShieldCheck, FileSpreadsheet, ArrowRight, Search, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { leaderboardService } from '../services/api';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleQuickSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await leaderboardService.getLeaderboard({ search: searchQuery.trim() });
      setSearchResults(res.data.students || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Next-Gen College Academic Leaderboard</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Fair & Automatic <br />
              <span className="bg-gradient-to-r from-amber-300 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Backlog-Priority Student Rankings
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              ClassRank ranks college students with strict priority: zero backlogs rank first, followed by percentage, CGPA, and roll number.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/leaderboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5 text-amber-950" />
                View Full Leaderboard
              </Link>

              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
              >
                Student Registration
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Quick Live Search Bar */}
            <div className="pt-8 max-w-xl mx-auto">
              <form onSubmit={handleQuickSearch} className="relative">
                <input
                  type="text"
                  placeholder="Quick lookup by Roll Number (e.g. 23JD1A0501) or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  {searching ? 'Searching...' : 'Lookup Rank'}
                </button>
              </form>

              {/* Quick Search Preview */}
              {searchResults && (
                <div className="mt-4 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-left shadow-2xl space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-2">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No matching student records found.</p>
                  ) : (
                    searchResults.slice(0, 4).map((st) => (
                      <div key={st.rollNumber} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                        <div>
                          <span className="text-sm font-bold text-white">{st.name}</span>
                          <span className="text-xs text-slate-400 font-mono ml-2">({st.rollNumber})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                            Rank #{st.overallRank}
                          </span>
                          <span className="text-slate-300 font-mono">{st.percentage}%</span>
                          <span className="text-amber-400 font-semibold">{st.backlogCount} Backlogs</span>
                        </div>
                      </div>
                    ))
                  )}
                  {searchResults.length > 4 && (
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="text-xs text-amber-300 hover:underline pt-1 block font-semibold"
                    >
                      View all results on Leaderboard &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Rules Highlight */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Deterministic Ranking Algorithm
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every student is evaluated systematically using standard academic priority rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Priority 1</span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Backlog Count ASC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                0 Backlogs &rarr; 1 Backlog &rarr; 2 Backlogs. Students with zero backlogs always rank higher regardless of percentage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Priority 2</span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Percentage DESC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Within each backlog group, students are sorted by overall percentage in descending order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Priority 3</span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                CGPA DESC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If percentage is identical, cumulative grade point average (CGPA) breaks the tie in descending order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Priority 4</span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
                Roll Number ASC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If percentage and CGPA are both identical, roll numbers are sorted in alphabetical ascending order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Visual Leaderboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grouped sections for 0 Backlogs, 1 Backlog, 2 Backlogs, and 3+ Backlogs with gold, silver, and bronze rank badges.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Excel Import & Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Batch import entire class rosters with automated row-by-row data validation and export sorted Excel rankings with a single click.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin Control Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive dashboard with aggregate statistics, student management CRUD, and permission locks for student data editing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300">ClassRank Academic Management Platform &copy; 2026</p>
          <p className="text-slate-500 mt-1">Built with React, Vite, Tailwind CSS, Express.js & MongoDB</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
