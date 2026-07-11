const validateScore = (score) => {
  return Number.isFinite(score) && score >= 0;
};

export const evaluateScore = (formType, topic, score) => {
  if (formType === "9q") {
    if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

    if (score >= 19) return "มีภาวะซึมเศร้าระดับรุนแรง";
    if (score >= 13) return "มีภาวะซึมเศร้าระดับปานกลาง";
    if (score >= 7) return "มีภาวะซึมเศร้าระดับน้อย ";

    return "ไม่มีภาวะซึมเศร้า";
  }

  if (formType === "8q") {
    if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

    if (score >= 17) return "มีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับรุนแรง";
    if (score >= 9) return "มีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับปานกลาง";
    if (score >= 1) return "มีแนวโน้มจะฆ่าตัวตายในปัจจุบันระดับน้อย";

    return "ไม่มีแนวโน้มจะฆ่าตัวตายในปัจจุบัน";
  }

  if (formType === "stress") {
    if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

    if (score >= 30) return "เครียดมาก";
    if (score >= 26) return "เครียดปานกลาง";
    if (score >= 18) return "เครียดเล็กน้อย";
    if (score >= 6) return "เครียดในระดับปกติ";

    return "ไม่มีภาวะเครียด";
  }

  if (formType === "st-5") {
    if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

    if (score >= 10) return "ความเครียดมากที่สุด";
    if (score >= 8) return "ความเครียดมาก";
    if (score >= 5) return "ความเครียดปานกลาง";

    return "ความเครียดน้อย ";
  }

  if (formType === "dass21") {
    if (topic === "d") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 14) return "ระดับรุนแรงที่สุด";
      if (score >= 11) return "ระดับรุนแรง";
      if (score >= 7) return "ระดับปานกลาง";
      if (score >= 5) return "ระดับต่ำ";

      return "ระดับปกติ";
    }
    if (topic === "a") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 10) return "ระดับรุนแรงที่สุด";
      if (score >= 8) return "ระดับรุนแรง";
      if (score >= 6) return "ระดับปานกลาง";
      if (score >= 4) return "ระดับต่ำ";

      return "ปกติ";
    }
    if (topic === "s") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 17) return "ระดับรุนแรงที่สุด";
      if (score >= 13) return "ระดับรุนแรง";
      if (score >= 10) return "ระดับปานกลาง";
      if (score >= 8) return "ระดับต่ำ";

      return "ปกติ";
    }
  }

  if (formType === "burnout") {
    if (topic === "emotionalScore") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 27) return "ระดับสูง";
      if (score >= 17) return "ระดับปานกลาง";

      return "ระดับต่ำ";
    }
    if (topic === "depersonalizationScore") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 13) return "ระดับสูง";
      if (score >= 7) return "ระดับปานกลาง";

      return "ระดับต่ำ";
    }
    if (topic === "personalAchievementScore") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 39) return "ระดับต่ำ่";
      if (score >= 32) return "ระดับปานกลาง";

      return "ระดับสูง";
    }
  }

  if (formType === "rq") {
    if (topic === "emotionalEndurance") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 35) return "สูงกว่าเกณฑ์ปกติ";
      if (score >= 27) return "เกณฑ์ปกติ";

      return "ต่ำกว่าเกณฑ์ปกติ";
    }
    if (topic === "encouragement") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 20) return "สูงกว่าเกณฑ์ปกติ";
      if (score >= 14) return "เกณฑ์ปกติ";

      return "ต่ำกว่าเกณฑ์ปกติ";
    }
    if (topic === "problemManagement") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 19) return "สูงกว่าเกณฑ์ปกติ";
      if (score >= 13) return "เกณฑ์ปกติ";

      return "ต่ำกว่าเกณฑ์ปกติ";
    }
    if (topic === "rqTotal") {
      if (!validateScore(score)) return "คะแนนไม่ถูกต้อง";

      if (score >= 70) return "สูงกว่าเกณฑ์ปกติ";
      if (score >= 55) return "เกณฑ์ปกติ";

      return "ต่ำกว่าเกณฑ์ปกติ";
    }
  }

  return "ไม่มีเกณฑ์ประเมิน";
};
