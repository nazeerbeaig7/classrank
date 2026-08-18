import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const BacklogBadge = ({ count }) => {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        0 Backlogs
      </span>
    );
  }

  if (count === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        1 Backlog
      </span>
    );
  }

  if (count === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
        2 Backlogs
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
      {count} Backlogs
    </span>
  );
};

export default BacklogBadge;
