const calculate9Q = (answers) => {
  if (!answers) return 0;
  return Object.values(answers).reduce((sum, val) => sum + (Number(val) || 0), 0);
};

const calculate8Q = (answers) => {
  if (!answers) return 0;
  const SCORES = {
    1: { true: 1, false: 0 },
    2: { true: 2, false: 0 },
    3: { true: 6, false: 0 },
    3.1: { true: 0, false: 8 },
    4: { true: 8, false: 0 },
    5: { true: 9, false: 0 },
    6: { true: 4, false: 0 },
    7: { true: 10, false: 0 },
    8: { true: 4, false: 0 },
  };
  return Object.entries(answers).reduce((total, [question, answer]) => {
    const valStr = String(answer).toLowerCase();
    if (SCORES[question] && SCORES[question][valStr] !== undefined) {
      return total + SCORES[question][valStr];
    }
    return total;
  }, 0);
};

const calculateStress = (answers) => {
  if (!answers) return 0;
  return Object.values(answers).reduce((sum, val) => sum + (Number(val) || 0), 0);
};

const calculateST5 = (answers) => {
  if (!answers) return 0;
  return Object.values(answers).reduce((sum, val) => sum + (Number(val) || 0), 0);
};

const calculateDASS21 = (answers) => {
  const scores = { d: 0, a: 0, s: 0 };
  if (!answers) return scores;
  const CATEGORY_MAPPING = {
    1: "s", 2: "a", 3: "d", 4: "a", 5: "d", 6: "s", 7: "a",
    8: "s", 9: "a", 10: "d", 11: "s", 12: "s", 13: "d", 14: "s",
    15: "a", 16: "d", 17: "d", 18: "s", 19: "a", 20: "a", 21: "d",
  };
  for (const [question, value] of Object.entries(answers)) {
    const category = CATEGORY_MAPPING[question];
    if (category) {
      scores[category] += Number(value) || 0;
    }
  }
  return scores;
};

const calculateBurnout = (answers) => {
  if (!answers) return { emotionalScore: 0, depersonalizationScore: 0, personalAchievementScore: 0 };
  const emotionalExhaustion = [1, 2, 3, 6, 8, 13, 14, 16, 20];
  const depersonalization = [5, 10, 11, 15, 22];
  const personalAchievement = [4, 7, 9, 12, 17, 18, 19, 21];

  const emotionalScore = emotionalExhaustion.reduce((sum, q) => sum + (Number(answers[q]) || 0), 0);
  const depersonalizationScore = depersonalization.reduce((sum, q) => sum + (Number(answers[q]) || 0), 0);
  const personalAchievementScore = personalAchievement.reduce((sum, q) => sum + (Number(answers[q]) || 0), 0);

  return {
    emotionalScore,
    depersonalizationScore,
    personalAchievementScore,
  };
};

const calculateRQ = (answers) => {
  if (!answers) return { emotionalEndurance: 0, encouragement: 0, problemManagement: 0, rqTotal: 0 };
  const emotionalEnduranceQuestions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const encouragementQuestions = [11, 12, 13, 14, 15];
  const problemManagementQuestions = [16, 17, 18, 19, 20];
  const negativeQuestions = [1, 5, 14, 15, 16];

  const calculateScore = (questions) => {
    return questions.reduce((sum, q) => {
      const value = Number(answers[q]) || 0;
      if (negativeQuestions.includes(q)) {
        return sum + (5 - value);
      }
      return sum + value;
    }, 0);
  };

  const emotionalEndurance = calculateScore(emotionalEnduranceQuestions);
  const encouragement = calculateScore(encouragementQuestions);
  const problemManagement = calculateScore(problemManagementQuestions);

  return {
    emotionalEndurance,
    encouragement,
    problemManagement,
    rqTotal: emotionalEndurance + encouragement + problemManagement,
  };
};

export const calculateFormScores = (formsType, answers) => {
  switch (formsType) {
    case "9q":
      return { scores: calculate9Q(answers) };
    case "8q":
      return { scores: calculate8Q(answers) };
    case "stress":
      return { scores: calculateStress(answers) };
    case "st-5":
      return { scores: calculateST5(answers) };
    case "dass21":
      return calculateDASS21(answers);
    case "burnout":
      return { scores: calculateBurnout(answers) };
    case "rq":
      return calculateRQ(answers);
    default:
      return {};
  }
};
