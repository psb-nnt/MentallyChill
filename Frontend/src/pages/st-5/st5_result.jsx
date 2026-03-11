import React, { useEffect, useState } from "react";
import { BaseResult, ResultIndicator } from "../../components/BaseResult";

export default function ST5Result() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem("st5Score");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.totalScore === "number") {
          setScore(parsed.totalScore);
          return;
        }
      } catch {}
    }
    // fallback: ถ้าเก็บเป็นเลขล้วน (กรณีมีการเปลี่ยนวิธีเซฟ)
    const fallback = localStorage.getItem("st5Score");
    if (fallback) setScore(parseInt(fallback, 10) || 0);
  }, []);

  const getLevelInfo = (s) => {
    if (s <= 4) {
      return {
        severity: "ความเครียดน้อย",
        color: "low",
        description:
          "คะแนน 0–4 ความเครียดน้อย\nความเครียดระดับนี้เป็นความเครียดในชีวิตประจำวันที่ทุกคนต้องเจออยู่แล้ว ซึ่งแต่ละคนสามารถปรับตัวได้เอง โดยไม่ก่อให้เกิดปัญหาสุขภาพ และที่สำคัญคุณยังสามารถช่วยดูแลคนอื่น ๆ ได้อีกด้วย",
      };
    }
    if (s <= 7) {
      return {
        severity: "ความเครียดปานกลาง",
        color: "moderate",
        description:
          "คะแนน 5–7 ความเครียดปานกลาง\nเป็นความเครียดที่เกิดจากการต้องเตรียมพร้อมในการจัดการปัญหาต่าง ๆ ซึ่งถือว่ายังปกติ เพราะความเครียดระดับนี้ทำให้เราเกิดความกระตือรือร้นในการเผชิญกับปัญหาที่เข้ามา",
      };
    }
    if (s <= 9) {
      return {
        severity: "ความเครียดมาก",
        color: "severe",
        description:
          "คะแนน 8–9 ความเครียดมาก\nความเครียดระดับนี้อาจทำให้เกิดการตอบสนองเหตุการณ์รุนแรงขึ้นชั่วคราวได้ แต่ก็มักจะลดลงมาเป็นปกติเมื่อเหตุการณ์สิ้นสุดหรือจบลง เครียดแบบนี้เรามีวิธีจัดการอย่างง่ายๆ",
        tips: [
          "หายใจเข้าลึก ๆ หายใจออกยาว ๆ อย่างต่อเนื่องไปจนรู้สึกผ่อนคลาย",
          "ควรนอนหลับพักผ่อนอย่างเพียงพอ",
          "พูดคุยกับคนใกล้ชิด",
          "ใช้หลักศาสนาทำให้คลายกังวล",
          "ให้กำลังใจตัวเองว่าเราจะฝ่าฟันอุปสรรคครั้งนี้ไปได้และมองด้านบวก",
          "ภายใน 2 สัปดาห์ หากยังไม่ดีขึ้น ควรไปพบแพทย์เพื่อประเมินซ้ำ (ความเครียดที่มากและต่อเนื่องอาจนำไปสู่โรควิตกกังวล/ภาวะซึมเศร้า/เสี่ยงต่อการฆ่าตัวตายได้)",
        ],
      };
    }
    return {
      severity: "ความเครียดมากที่สุด",
      color: "severe",
      description:
        "คะแนน 10–15 ความเครียดมากที่สุด\nความเครียดระดับที่รุนแรง ซึ่งส่งผลต่อสุขภาพร่างกายและจิตใจ อาจเกิดโรควิตกกังวล ภาวะซึมเศร้า และเสี่ยงต่อการฆ่าตัวตายได้ ควรเข้ารับการรักษาจากแพทย์ทันที เพื่อรับการดูแลต่อเนื่องอย่างใกล้ชิดไปอีก 3–6 เดือน",
    };
  };

  const { severity, color, description, tips } = getLevelInfo(score);

  return (
    <BaseResult title="ผลการประเมินความเครียด (ST-5)">
      <div className="mental-detail">
        <ResultIndicator
          label=""
          score={score}
          severity={severity}
          color={color}
        />

        <div
          style={{
            padding: "20px",
            marginTop: "20px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            maxWidth: "100%",
          }}
        >
          <h3
            style={{
              marginBottom: "10px",
              color: "#333",
              textAlign: "center",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
              fontWeight: "bold",
            }}
          >
            สรุปผลการประเมิน
          </h3>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#666",
              whiteSpace: "pre-line",
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
              padding: "10px 12px",
            }}
          >
            {description}
          </p>

          {Array.isArray(tips) && tips.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
                แนวทางการจัดการเบื้องต้น
              </h4>
              <ul
                style={{
                  paddingLeft: 20,
                  margin: 0,
                  color: "#666",
                  fontSize: 14,
                }}
              >
                {tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
            <p>
              * หากมีความกังวลเกี่ยวกับสุขภาพจิต
              สามารถขอรับคำปรึกษาจากเจ้าหน้าที่ได้
            </p>
          </div>
        </div>
      </div>
    </BaseResult>
  );
}
