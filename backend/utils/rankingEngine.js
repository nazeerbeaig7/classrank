/**
 * ClassRank Core Ranking Engine
 * 
 * Ranking Priority:
 * 1. Backlog Count: ASCENDING (0 -> 1 -> 2 -> 3...)
 * 2. Percentage: DESCENDING (Higher % ranks higher)
 * 3. CGPA: DESCENDING (Higher CGPA breaks ties)
 * 4. Roll Number: ASCENDING (Alphabetical order tie-breaker)
 */

/**
 * Sorts array of student objects according to ClassRank rules.
 */
const sortStudents = (students) => {
  return [...students].sort((a, b) => {
    // 1. Backlog Count ASC
    if (a.backlogCount !== b.backlogCount) {
      return a.backlogCount - b.backlogCount;
    }
    // 2. Percentage DESC
    if (a.percentage !== b.percentage) {
      return b.percentage - a.percentage;
    }
    // 3. CGPA DESC
    if (a.cgpa !== b.cgpa) {
      return b.cgpa - a.cgpa;
    }
    // 4. Roll Number ASC (alphabetical)
    return String(a.rollNumber).localeCompare(String(b.rollNumber));
  });
};

/**
 * Attaches overall ranks and group ranks to sorted student objects.
 */
const calculateRanks = (sortedStudents) => {
  const groupCounters = {};
  
  return sortedStudents.map((student, index) => {
    const studentObj = student.toObject ? student.toObject() : { ...student };
    const overallRank = index + 1;
    
    const bg = studentObj.backlogCount;
    groupCounters[bg] = (groupCounters[bg] || 0) + 1;
    const groupRank = groupCounters[bg];

    return {
      ...studentObj,
      overallRank,
      groupRank
    };
  });
};

/**
 * Computes dashboard and summary statistics.
 */
const calculateStats = (students) => {
  const total = students.length;
  if (total === 0) {
    return {
      totalStudents: 0,
      zeroBacklogs: 0,
      oneBacklog: 0,
      twoBacklogs: 0,
      threePlusBacklogs: 0,
      highestPercentage: 0,
      highestCgpa: 0,
      averagePercentage: 0,
      averageCgpa: 0
    };
  }

  let zeroBacklogs = 0;
  let oneBacklog = 0;
  let twoBacklogs = 0;
  let threePlusBacklogs = 0;
  
  let highestPercentage = 0;
  let highestCgpa = 0;
  let sumPercentage = 0;
  let sumCgpa = 0;

  students.forEach(s => {
    if (s.backlogCount === 0) zeroBacklogs++;
    else if (s.backlogCount === 1) oneBacklog++;
    else if (s.backlogCount === 2) twoBacklogs++;
    else if (s.backlogCount >= 3) threePlusBacklogs++;

    if (s.percentage > highestPercentage) highestPercentage = s.percentage;
    if (s.cgpa > highestCgpa) highestCgpa = s.cgpa;

    sumPercentage += s.percentage;
    sumCgpa += s.cgpa;
  });

  return {
    totalStudents: total,
    zeroBacklogs,
    oneBacklog,
    twoBacklogs,
    threePlusBacklogs,
    highestPercentage: Number(highestPercentage.toFixed(2)),
    highestCgpa: Number(highestCgpa.toFixed(2)),
    averagePercentage: Number((sumPercentage / total).toFixed(2)),
    averageCgpa: Number((sumCgpa / total).toFixed(2))
  };
};

module.exports = {
  sortStudents,
  calculateRanks,
  calculateStats
};
