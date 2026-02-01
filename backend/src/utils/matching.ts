export const calculateMatchScore = (candidateSkills: string[], requiredSkills: string[]): number => {
  if (requiredSkills.length === 0) return 0;

  const matchedSkills = candidateSkills.filter((skill) =>
    requiredSkills.some(
      (req) => req.toLowerCase().includes(skill.toLowerCase()) ||
               skill.toLowerCase().includes(req.toLowerCase())
    )
  );

  const score = (matchedSkills.length / requiredSkills.length) * 100;
  return Math.min(100, Math.round(score));
};

export const sortCandidatesByScore = (
  candidates: Array<{ matchScore: number; [key: string]: any }>
): Array<{ matchScore: number; [key: string]: any }> => {
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
};

export const getTopCandidates = (
  candidates: Array<{ matchScore: number; [key: string]: any }>,
  limit: number = 3
): Array<{ matchScore: number; [key: string]: any }> => {
  return sortCandidatesByScore(candidates).slice(0, limit);
};
