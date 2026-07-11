import pool from "../Config/db.js";
import json2csv from "json2csv";
import { evaluateScore } from "../Helpers/scoreEvaluator.js";

const exportcsvformResuit = async (res) => {
  try {
    // JOIN ตาราง forms_result กับ users (สมมติว่าตาราง users ใช้ id เป็น Primary Key)
    const query = `
            SELECT
                r.result_id,
                r.user_id,
                r.forms_type,
                r.result AS form_data,
                r.created,
                u.gender,
                u.age,
                u.email,
                u.phone,
                u.phone_emergency,
                u.grade_level
            FROM forms_result r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created DESC
        `;
    const formResults = await pool.query(query);

    const transformedData = [];

    formResults.rows.forEach((row) => {
      const resultData =
        typeof row.form_data === "string"
          ? JSON.parse(row.form_data)
          : row.form_data || {};

      // ข้อมูล User พื้นฐานที่จะต้องมีทุกบรรทัด (เอา uid ออกไปแล้ว)
      const baseData = {
        result_id: row.result_id,
        user_id: row.user_id,
        gender: row.gender,
        age: row.age,
        email: row.email,
        phone: row.phone,
        phone_emergency: row.phone_emergency,
        grade_level: row.grade_level,
        forms_type: row.forms_type,
        created: row.created,
      };

      // ดึงคะแนน (Dynamic Parsing แบบเดิม)
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

      // นำคะแนนมาแตกแถว พร้อมกับนำคะแนนไป "ประเมินผล"
      for (const [topic, score] of Object.entries(extractedScores)) {
        // โยนตัวเลขไปเข้าฟังก์ชันประเมินด้านบน เพื่อเอาคำแปลผลกลับมา
        const evaluationResultText = evaluateScore(
          row.forms_type,
          topic,
          score,
        );

        transformedData.push({
          ...baseData,
          topic: topic,
          score: score,
          evaluation_result: evaluationResultText, // เพิ่มคอลัมน์ผลประเมิน
        });
      }
    });

    // กำหนดหัวคอลัมน์ของ CSV ใหม่ให้ครอบคลุมข้อมูล User และ ผลการประเมิน
    const fields = [
      "result_id",
      "user_id",
      "gender",
      "age",
      "email",
      "phone",
      "phone_emergency",
      "grade_level",
      "forms_type",
      "topic",
      "score",
      "evaluation_result",
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
