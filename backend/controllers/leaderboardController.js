const Student = require('../models/Student');
const { sortStudents, calculateRanks, calculateStats } = require('../utils/rankingEngine');

// @desc    Get complete sorted leaderboard with backlog groupings
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { search, backlogFilter, sortBy, sortOrder } = req.query;

    const allStudents = await Student.find({});
    
    // Default Official ClassRank Sort Engine Priority:
    // backlogCount ASC -> percentage DESC -> cgpa DESC -> rollNumber ASC
    const officialSorted = sortStudents(allStudents);
    let rankedStudents = calculateRanks(officialSorted);

    // Summary statistics
    const stats = calculateStats(allStudents);

    // Optional frontend search filter
    if (search) {
      const q = search.toString().trim().toLowerCase();
      rankedStudents = rankedStudents.filter(s =>
        s.rollNumber.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      );
    }

    // Optional backlog filter
    if (backlogFilter !== undefined && backlogFilter !== '' && backlogFilter !== 'all') {
      if (backlogFilter.endsWith('+')) {
        const minVal = Number(backlogFilter.replace('+', ''));
        rankedStudents = rankedStudents.filter(s => s.backlogCount >= minVal);
      } else {
        const filterVal = Number(backlogFilter);
        rankedStudents = rankedStudents.filter(s => s.backlogCount === filterVal);
      }
    }

    // Custom secondary sorting if selected in custom view
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      rankedStudents.sort((a, b) => {
        if (sortBy === 'percentage') {
          return (a.percentage - b.percentage) * order;
        } else if (sortBy === 'cgpa') {
          return (a.cgpa - b.cgpa) * order;
        } else if (sortBy === 'backlogCount') {
          return (a.backlogCount - b.backlogCount) * order;
        } else if (sortBy === 'rollNumber') {
          return a.rollNumber.localeCompare(b.rollNumber) * order;
        }
        return 0;
      });
    }

    // Dynamic grouping for any backlog count present (0, 1, 2, 3, 4, 5, 6, 7...)
    const uniqueBacklogCounts = [...new Set(rankedStudents.map(s => s.backlogCount))].sort((a, b) => a - b);
    const backlogGroups = uniqueBacklogCounts.map(count => ({
      backlogCount: count,
      title: count === 0 ? '0 BACKLOGS SECTION' : `${count} BACKLOG${count > 1 ? 'S' : ''} SECTION`,
      students: rankedStudents.filter(s => s.backlogCount === count)
    }));

    // Legacy groups fallback for backward compatibility
    const groups = {
      zeroBacklogs: rankedStudents.filter(s => s.backlogCount === 0),
      oneBacklog: rankedStudents.filter(s => s.backlogCount === 1),
      twoBacklogs: rankedStudents.filter(s => s.backlogCount === 2),
      threePlusBacklogs: rankedStudents.filter(s => s.backlogCount >= 3)
    };

    res.json({
      success: true,
      stats,
      count: rankedStudents.length,
      students: rankedStudents,
      backlogGroups,
      groups
    });
  } catch (error) {
    console.error('[LeaderboardCtrl] Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving leaderboard' });
  }
};

module.exports = {
  getLeaderboard
};
