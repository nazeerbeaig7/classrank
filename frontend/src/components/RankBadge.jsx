import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';

const RankBadge = ({ rank, type = 'overall' }) => {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold rank-badge-gold shadow-sm border border-amber-300">
        <Trophy className="w-3.5 h-3.5 text-amber-800 animate-bounce" />
        Rank 1
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold rank-badge-silver shadow-sm border border-slate-300">
        <Award className="w-3.5 h-3.5 text-slate-700" />
        Rank 2
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold rank-badge-bronze shadow-sm border border-orange-300">
        <Medal className="w-3.5 h-3.5 text-amber-900" />
        Rank 3
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      #{rank}
    </span>
  );
};

export default RankBadge;
