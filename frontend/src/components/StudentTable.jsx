import React from 'react';
import RankBadge from './RankBadge';
import BacklogBadge from './BacklogBadge';
import { Edit3, Trash2, GraduationCap } from 'lucide-react';

const StudentTable = ({ students = [], isAdmin = false, onEdit, onDelete, showGroupRank = false }) => {
  if (students.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700">No Student Records Found</h4>
        <p className="text-xs text-slate-500 mt-1">There are currently no students matching the specified criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
            <th className="py-3.5 px-4 text-center w-24">Rank</th>
            <th className="py-3.5 px-4">Roll Number</th>
            <th className="py-3.5 px-4">Student Name</th>
            <th className="py-3.5 px-4 text-center">Backlogs</th>
            <th className="py-3.5 px-4 text-right">CGPA</th>
            <th className="py-3.5 px-4 text-right">Percentage</th>
            {isAdmin && <th className="py-3.5 px-4 text-center w-28">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {students.map((student) => {
            const displayRank = showGroupRank ? student.groupRank : student.overallRank;
            const isTopRank = displayRank === 1;

            return (
              <tr
                key={student._id || student.rollNumber}
                className={`transition-colors ${
                  displayRank === 1
                    ? 'bg-amber-50/40 hover:bg-amber-50/70 font-medium'
                    : displayRank === 2
                    ? 'bg-slate-50/70 hover:bg-slate-100/70'
                    : displayRank === 3
                    ? 'bg-orange-50/30 hover:bg-orange-50/60'
                    : 'hover:bg-indigo-50/30'
                }`}
              >
                {/* Rank */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <RankBadge rank={displayRank} />
                </td>

                {/* Roll Number */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                  {student.rollNumber}
                </td>

                {/* Name */}
                <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {student.name}
                    {isTopRank && <span className="text-xs">✨</span>}
                  </div>
                  {student.email && (
                    <span className="text-xs font-normal text-slate-400 block">{student.email}</span>
                  )}
                </td>

                {/* Backlogs */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <BacklogBadge count={student.backlogCount} />
                </td>

                {/* CGPA */}
                <td className="py-3.5 px-4 text-right font-bold text-slate-800 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-900">
                    {student.cgpa !== undefined ? student.cgpa.toFixed(2) : 'N/A'}
                  </span>
                </td>

                {/* Percentage */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-extrabold text-indigo-700 text-base font-mono">
                    {student.percentage !== undefined ? `${student.percentage.toFixed(2)}%` : 'N/A'}
                  </span>
                </td>

                {/* Actions (Admin) */}
                {isAdmin && (
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit && onEdit(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Student"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
