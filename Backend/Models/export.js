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
      // 1. แปลงข้อมูล
      const resultData =
        typeof row.result === "string"
          ? JSON.parse(row.result)
          : row.result || {};
      const uid = resultData.uid || "";

      // ข้อมูลพื้นฐานที่ต้องมีทุกแถว
      const baseData = {
        result_id: row.result_id,
        user_id: row.user_id,
        forms_type: row.forms_type,
        created: row.created,
        uid: uid,
      };

      // 2. ดึงคะแนนออกมาแบบอัตโนมัติ (Dynamic Extraction)
      let extractedScores = {};

      if (resultData.scores !== undefined) {
        if (
          typeof resultData.scores === "object" &&
          resultData.scores !== null
        ) {
          // กรณี: burnout (scores เป็นก้อน Object เช่น {"emotionalScore":38,...})
          extractedScores = resultData.scores;
        } else {
          // กรณี: stress, st-5 (scores เป็นค่าตัวเลขเดียว)
          extractedScores = { total: resultData.scores };
        }
      } else {
        // กรณี: dass21 (คะแนนอยู่ระดับนอกสุด เช่น "d":17, "a":8, "s":21)
        for (const key in resultData) {
          // ข้ามคีย์ที่ไม่ใช่คะแนน เช่น uid หรือ answers (ข้อมูลดิบ)
          if (
            key !== "uid" &&
            key !== "answers" &&
            typeof resultData[key] !== "object"
          ) {
            extractedScores[key] = resultData[key];
          }
        }
      }

      // 3. นำคะแนนที่สกัดได้ มาแตกเป็นแถวๆ
      for (const [topic, score] of Object.entries(extractedScores)) {
        transformedData.push({
          ...baseData,
          topic: topic,
          score: score,
        });
      }
    });

    // 4. สร้าง CSV
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
