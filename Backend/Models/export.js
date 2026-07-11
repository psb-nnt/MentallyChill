import pool from "../Config/db.js";
import json2csv from "json2csv";

// const exportcsvformResuit = async (res) => {
//     try{
//         const formResults = await pool.query(
//             `SELECT * FROM forms_result ORDER BY created DESC`
//         );
//         const fields = ['result_id', 'user_id', 'forms_type', 'result', 'created'];
//         const csv = json2csv.parse(formResults.rows, { fields });
//         res.setHeader('Content-disposition', 'attachment; filename=formResult.csv');
//         res.set('Content-Type', 'text/csv');
//         res.status(200).send(csv);
//     }
//     catch(err){
//         console.error('Error exporting form result data:', err);
//         res.sendStatus(500);
//     }
// }

const exportcsvformResuit = async (res) => {
  try {
    const formResults = await pool.query(
      `SELECT * FROM forms_result ORDER BY created DESC`,
    );

    const transformedData = [];

    formResults.rows.forEach((row) => {
      const resultData =
        typeof row.result === "string"
          ? JSON.parse(row.result)
          : row.result || {};
      const uid = resultData.uid || "";

      const baseData = {
        result_id: row.result_id,
        user_id: row.user_id,
        forms_type: row.forms_type,
        created: row.created,
        uid: uid,
      };

      let extractedScores = {};

      if (resultData.scores !== undefined) {
        if (
          typeof resultData.scores === "object" &&
          resultData.scores !== null
        ) {
          extractedScores = resultData.scores;
        } else {
          extractedScores = { total: resultData.scores };
        }
      } else {
        for (const key in resultData) {
          if (
            key !== "uid" &&
            key !== "answers" &&
            typeof resultData[key] !== "object"
          ) {
            extractedScores[key] = resultData[key];
          }
        }
      }

      for (const [topic, score] of Object.entries(extractedScores)) {
        transformedData.push({
          ...baseData,
          topic: topic,
          score: score,
        });
      }
    });

    const fields = [
      "result_id",
      "user_id",
      "uid",
      "forms_type",
      "topic",
      "score",
      "created",
    ];
    const csv = json2csv.parse(transformedData, { fields });

    res.setHeader("Content-disposition", "attachment; filename=formResult.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error exporting form result data:", err);
    res.sendStatus(500);
  }
};

const exportcsvAppointment = async (res) => {
  try {
    const appointments = await pool.query(
      `SELECT * FROM appointment ORDER BY created DESC`,
    );
    const fields = [
      "booking_id",
      "user_id",
      "appointment_date",
      "status",
      "pre_note",
      "post_note",
      "post_feedback",
      "post_conclusion",
      "created",
    ];

    const csv = json2csv.parse(appointments.rows, { fields });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=appointment.csv",
    );
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error exporting appointment data:", err);
    res.sendStatus(500);
  }
};

export { exportcsvformResuit, exportcsvAppointment };
