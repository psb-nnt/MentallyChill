import e from "express";
import pool from "../Config/db.js";
import lineRouter from "../Routes/lineRoutes.js";
import { calculateFormScores } from "../Helpers/scoreCalculator.js";

const processResultPayload = (forms_type, result) => {
  try {
    let resultObj = typeof result === "string" ? JSON.parse(result) : result;
    if (!resultObj) return result;

    let answers = resultObj.answers;

    // Fallback: extract any keys from the root object that are not standard metadata/score keys
    if (!answers) {
      answers = {};
      const excludedKeys = new Set([
        "uid", "scores", "d", "a", "s", "emotionalScore", "depersonalizationScore",
        "personalAchievementScore", "emotionalEndurance", "encouragement",
        "problemManagement", "rqTotal"
      ]);
      for (const key in resultObj) {
        if (!excludedKeys.has(key) && typeof resultObj[key] !== "object") {
          answers[key] = resultObj[key];
        }
      }
    }

    const calculatedScores = calculateFormScores(forms_type, answers);

    // Merge calculated scores into payload
    resultObj = {
      ...resultObj,
      ...calculatedScores
    };

    return JSON.stringify(resultObj);
  } catch (error) {
    console.error("Error processing result payload in backend:", error);
    return result;
  }
};

const newFormResult = async (uid, form_id, result) => {
    const processedResult = processResultPayload(form_id, result);
    const newFormResult = await pool.query(
        `INSERT INTO forms_result (user_id, forms_type, result) VALUES($1, $2, $3) RETURNING *`,
        [uid, form_id, processedResult]
    );
    return (newFormResult["rows"][0]);
}

const deleteFormResult = async (result_id) => {
    const formResult = await pool.query(
        `DELETE FROM forms_result WHERE result_id = $1`,
        [result_id]
    );
    return (formResult["rows"][0]);
}

const lookupFormResult = async (result_id) => {
    const formResult = await pool.query(
        `SELECT * FROM forms_result INNER JOIN users ON users.user_id = forms_result.user_id WHERE result_id = $1`,
        [result_id]
    );
    return (formResult["rows"]);
}

const userFormResult = async (uid) => {
    const formResults = await pool.query(
        `SELECT * FROM forms_result WHERE user_id = $1 ORDER BY created DESC`,
        [uid]
    );
    return (formResults["rows"]);
}

const allFormResults = async () => {
    const formResults = await pool.query(
        `SELECT * FROM forms_result ORDER BY created DESC`
    );
    return (formResults["rows"]);
}

// ONLY FOR SUBMISSION USING LINE_UID [FRONTEND ONLY]
const submitForms = async (uid, forms_type, result) => {
    const processedResult = processResultPayload(forms_type, result);
    const newFormResult = await pool.query(
        `INSERT INTO forms_result (user_id, forms_type, result) VALUES ((SELECT user_id FROM users WHERE line_uid = $1), $2, $3) RETURNING *`,
        [uid, forms_type, processedResult]
    );

    return (newFormResult["rows"][0]);
}

const diagnosisCount = async (uid) => {
    const diagnosisCount = await pool.query(
        `SELECT COUNT(*) FROM forms_result`
    );
    return (diagnosisCount["rows"][0]);
}

const getFormsType = async () => {
    const formsType = await pool.query(
        `SELECT DISTINCT forms_type FROM forms_result`
    );
    return (formsType["rows"]);
}

export {
    newFormResult,
    deleteFormResult,
    lookupFormResult,
    userFormResult,
    allFormResults,
    submitForms,
    diagnosisCount,
    getFormsType,
};